import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Download, Eye, Calendar, Clock, CheckCircle, X, Users, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import QuizAnalyticsDashboard from '../components/analytics/QuizAnalyticsDashboard';

// --- Mock Data Types & Generation ---

interface Response {
    id: string;
    userName: string;
    email: string;
    score: number; // 0-100 percentage
    timeTaken: number; // in mins
    submittedAt: string; // ISO or formatted date
    status: 'passed' | 'failed' | 'completed';
}

const generateMockResponses = (count: number): Response[] => {
    const responses: Response[] = [];
    const firstNames = ['Alex', 'Maria', 'James', 'Linda', 'Eve', 'David', 'Sarah', 'Michael', 'Emma', 'John', 'Sophia', 'Daniel', 'Olivia', 'William', 'Ava'];
    const lastNames = ['Johnson', 'Garcia', 'Wilson', 'Chen', 'Carter', 'Smith', 'Lee', 'Brown', 'Davis', 'Miller', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const score = Math.floor(Math.random() * 61) + 40; // 40 to 100
        const timeTaken = Math.floor(Math.random() * 25) + 5; // 5 to 30 mins

        // Generate random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        responses.push({
            id: `r${i + 1}`,
            userName: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            score: score,
            timeTaken: timeTaken,
            submittedAt: date.toISOString().split('T')[0],
            status: score >= 60 ? 'passed' : 'failed' // Assuming 60% is passing
        });
    }

    // Sort by date descending
    return responses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

const MOCK_DATABASES: Record<string, { title: string, attempts: number, responses: Response[] }> = {
    'q1': { title: 'React Fundamentals', attempts: 45, responses: generateMockResponses(45) },
    'q2': { title: 'UI/UX Design Basics', attempts: 28, responses: generateMockResponses(28) },
    'q3': { title: 'Advanced JavaScript', attempts: 60, responses: generateMockResponses(60) },
    'q4': { title: 'Python Backend APIs', attempts: 12, responses: generateMockResponses(12) },
    'q5': { title: 'Node.js Backend Architecture', attempts: 0, responses: [] }, // Empty state
};


const QuizResponsesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch data based on ID, fallback to generic if not found
    const quizData = id && MOCK_DATABASES[id] ? MOCK_DATABASES[id] : { title: 'Unknown Quiz', attempts: 0, responses: [] };

    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'all', '7days', '30days'
    const [scoreFilter, setScoreFilter] = useState('all'); // 'all', '0-40', '40-70', '70-100'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'passed', 'failed'

    // Filtering Logic
    const filteredResponses = quizData.responses.filter(response => {
        // Search Filter
        const matchesSearch = response.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            response.email.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // Status Filter
        if (statusFilter !== 'all' && response.status !== statusFilter) return false;

        // Score Filter
        if (scoreFilter !== 'all') {
            const score = response.score;
            if (scoreFilter === '0-40' && (score < 0 || score > 40)) return false;
            if (scoreFilter === '40-70' && (score <= 40 || score > 70)) return false;
            if (scoreFilter === '70-100' && (score <= 70 || score > 100)) return false;
        }

        // Date Filter
        if (dateFilter !== 'all') {
            const submitDate = new Date(response.submittedAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - submitDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === '7days' && diffDays > 7) return false;
            if (dateFilter === '30days' && diffDays > 30) return false;
        }

        return true;
    });

    return (
        <DashboardLayout>
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-8 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 mt-4 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/my-quizzes')}
                            className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500 hover:text-indigo-600 mb-3 md:mb-4 transition-colors w-fit"
                        >
                            <ArrowLeft size={16} /> Back to My Quizzes
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 md:gap-3">
                            {quizData.title}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
                            Viewing analytics and individual responses
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                        <span className="justify-center px-4 py-2 md:py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold flex items-center gap-2 text-sm">
                            <Users size={16} className="shrink-0 md:w-[18px] md:h-[18px]" /> {quizData.attempts} Total Attempts
                        </span>
                        <button className="justify-center px-4 py-2 md:px-5 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm md:text-base">
                            <Download size={16} className="shrink-0 md:w-[18px] md:h-[18px]" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Top Section: Advanced Analytics Dashboard */}
                {quizData.attempts > 0 ? (
                    <>
                        <div className="bg-slate-50/50 p-4 md:p-6 rounded-2xl md:rounded-[24px] border border-slate-200">
                            <QuizAnalyticsDashboard quizTitle={quizData.title} />
                        </div>

                        {/* Bottom Section: Responses Data Table */}
                        <div className="bg-white rounded-2xl md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                            {/* Table Header & Filters */}
                            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col gap-4 md:gap-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold text-slate-800">Detailed Responses</h2>
                                        <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5 md:mt-1">Review the submissions for {filteredResponses.length} student{filteredResponses.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <button onClick={() => { setSearchQuery(''); setDateFilter('all'); setScoreFilter('all'); setStatusFilter('all'); }} className="text-xs md:text-sm font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors self-start sm:self-auto mt-2 sm:mt-0">
                                        <RefreshCw size={14} /> Reset Filters
                                    </button>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                                    {/* Search Bar */}
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Search size={16} className="md:w-[18px] md:h-[18px]" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>

                                    {/* Filters Group */}
                                    <div className="flex flex-wrap lg:flex-nowrap gap-2 md:gap-3">
                                        {/* Date Range Filter */}
                                        <div className="relative flex-1 min-w-[130px] md:min-w-[140px]">
                                            <select
                                                value={dateFilter}
                                                onChange={(e) => setDateFilter(e.target.value)}
                                                className="w-full pl-8 md:pl-10 pr-6 md:pr-8 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                            >
                                                <option value="all">All Dates</option>
                                                <option value="7days">Last 7 Days</option>
                                                <option value="30days">Last 30 Days</option>
                                            </select>
                                            <Calendar size={14} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none md:w-4 md:h-4" />
                                            <Filter size={12} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none md:w-3.5 md:h-3.5" />
                                        </div>

                                        {/* Score Range Filter */}
                                        <div className="relative flex-1 min-w-[130px] md:min-w-[150px]">
                                            <select
                                                value={scoreFilter}
                                                onChange={(e) => setScoreFilter(e.target.value)}
                                                className="w-full pl-3 md:pl-4 pr-6 md:pr-8 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                            >
                                                <option value="all">Score: All</option>
                                                <option value="0-40">Score: 0-40%</option>
                                                <option value="40-70">Score: 40-70%</option>
                                                <option value="70-100">Score: 70-100%</option>
                                            </select>
                                            <Filter size={12} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none md:w-3.5 md:h-3.5" />
                                        </div>

                                        {/* Status Filter */}
                                        <div className="relative flex-1 min-w-[130px] md:min-w-[140px]">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full pl-3 md:pl-4 pr-6 md:pr-8 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                            >
                                                <option value="all">Status: All</option>
                                                <option value="passed">Passed</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                            <Filter size={12} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none md:w-3.5 md:h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[0.65rem] md:text-[0.7rem] uppercase font-bold text-slate-400 tracking-wider">
                                            <th className="p-3 md:p-5 pl-4 md:pl-8">Participant</th>
                                            <th className="p-3 md:p-5 text-center">Score / %</th>
                                            <th className="p-3 md:p-5 text-center">Status</th>
                                            <th className="p-3 md:p-5">Time Taken</th>
                                            <th className="p-3 md:p-5">Submission Date</th>
                                            <th className="p-3 md:p-5 pr-4 md:pr-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredResponses.length > 0 ? (
                                            filteredResponses.map(res => (
                                                <tr key={res.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                    <td className="p-3 md:p-5 pl-4 md:pl-8">
                                                        <div className="font-bold text-slate-800 text-xs md:text-sm whitespace-nowrap">{res.userName}</div>
                                                        <div className="text-[0.65rem] md:text-xs text-slate-500 font-medium mt-0.5">{res.email}</div>
                                                    </td>
                                                    <td className="p-3 md:p-5 text-center">
                                                        <div className={`inline-flex items-center justify-center px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold min-w-[3.5rem] md:min-w-[4rem] border ${res.score >= 70 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : res.score >= 40 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            {res.score}%
                                                        </div>
                                                    </td>
                                                    <td className="p-3 md:p-5 text-center">
                                                        <div className={`inline-flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[0.65rem] md:text-xs font-bold uppercase tracking-wider ${res.status === 'passed' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                                            {res.status === 'passed' ? <CheckCircle size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <X size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />} {res.status}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 md:p-5">
                                                        <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap">
                                                            <Clock size={16} className="text-slate-400 w-3.5 h-3.5 md:w-4 md:h-4" /> {res.timeTaken} mins
                                                        </div>
                                                    </td>
                                                    <td className="p-3 md:p-5">
                                                        <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap">
                                                            <Calendar size={16} className="text-slate-400 w-3.5 h-3.5 md:w-4 md:h-4" /> {res.submittedAt}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 md:p-5 pr-4 md:pr-8 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 text-[0.65rem] md:text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap" title="View Detailed Response">
                                                                <Eye size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" /> View
                                                            </button>
                                                            <button className="p-1 md:p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-colors" title="Download Result">
                                                                <Download size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-8 md:p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3 md:mb-4">
                                                            <Filter size={24} className="w-5 h-5 md:w-6 md:h-6" />
                                                        </div>
                                                        <p className="text-base md:text-lg font-bold text-slate-700">No responses match your filters</p>
                                                        <p className="text-xs md:text-sm text-slate-500 mt-1">Try adjusting your date, score, or status criteria.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State for Quizzes with 0 attempts */
                    <div className="bg-white rounded-2xl md:rounded-[24px] border border-dashed border-slate-300 p-8 md:p-16 flex flex-col items-center justify-center text-center mt-4 md:mt-8">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4 md:mb-5">
                            <Users size={40} className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">No responses yet</h3>
                        <p className="text-xs md:text-sm text-slate-500 mb-6 max-w-sm">
                            This quiz hasn't received any submissions yet. Share it with your students to start collecting data!
                        </p>
                        <button className="px-5 py-2.5 md:px-6 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all text-sm md:text-base">
                            Share Quiz Link
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default QuizResponsesPage;

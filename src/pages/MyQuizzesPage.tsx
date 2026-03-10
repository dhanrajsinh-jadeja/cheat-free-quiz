import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Plus, BookOpen, Clock, CheckCircle, FileText, X, Users, Calendar, Download, Eye, Copy, Share2, Trash2, ArrowDownToLine, BarChart2, ListFilter } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

// --- Mock Data ---

interface Quiz {
    id: string;
    title: string;
    category: string;
    questionCount: number;
    timeLimit: number; // in mins
    marks: number;
    status: 'draft' | 'published';
    createdAt: string;
    attempts: number;
    avgScore: number;
    tags: string[];
}

const mockQuizzes: Quiz[] = [
    { id: 'q1', title: 'React Fundamentals', category: 'Programming', questionCount: 15, timeLimit: 20, marks: 30, status: 'published', createdAt: '2026-03-01', attempts: 124, avgScore: 78, tags: ['React', 'Frontend'] },
    { id: 'q2', title: 'UI/UX Design Basics', category: 'Design', questionCount: 10, timeLimit: 15, marks: 10, status: 'published', createdAt: '2026-03-05', attempts: 56, avgScore: 82, tags: ['Design', 'UI'] },
    { id: 'q3', title: 'Advanced TypeScript', category: 'Programming', questionCount: 20, timeLimit: 30, marks: 40, status: 'draft', createdAt: '2026-03-08', attempts: 0, avgScore: 0, tags: ['TypeScript'] },
    { id: 'q4', title: 'Marketing 101', category: 'Marketing', questionCount: 5, timeLimit: 10, marks: 5, status: 'published', createdAt: '2026-02-15', attempts: 312, avgScore: 65, tags: ['Basics'] },
    { id: 'q5', title: 'Node.js Backend Architecture', category: 'Programming', questionCount: 25, timeLimit: 45, marks: 50, status: 'draft', createdAt: '2026-02-28', attempts: 0, avgScore: 0, tags: ['Node.js', 'Backend'] },
];

interface AttemptedQuiz {
    id: string;
    quizTitle: string;
    category: string;
    score: number;
    totalMarks: number;
    timeTaken: number; // in mins
    submittedAt: string;
    status: 'passed' | 'failed' | 'completed';
}

const mockAttemptedQuizzes: AttemptedQuiz[] = [
    { id: 'aq1', quizTitle: 'JavaScript Basics', category: 'Programming', score: 85, totalMarks: 100, timeTaken: 12, submittedAt: '2026-03-08 10:30 AM', status: 'passed' },
    { id: 'aq2', quizTitle: 'Advanced CSS', category: 'Design', score: 60, totalMarks: 100, timeTaken: 19, submittedAt: '2026-03-07 02:15 PM', status: 'failed' },
    { id: 'aq3', quizTitle: 'Git workflow', category: 'Productivity', score: 95, totalMarks: 100, timeTaken: 8, submittedAt: '2026-03-06 09:00 AM', status: 'passed' },
];

const MyQuizzesPage: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'most_responses' | 'highest_avg'>('newest');

    const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<'created' | 'attempted'>('created');
    const navigate = useNavigate();

    // Click outside to close active dropdown
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Derived stats
    const totalQuizzes = quizzes.length;
    const publishedQuizzes = quizzes.filter(q => q.status === 'published').length;
    const totalResponses = quizzes.reduce((acc, q) => acc + q.attempts, 0);
    const avgScoreAll = totalQuizzes > 0
        ? Math.round(quizzes.reduce((acc, q) => acc + q.avgScore, 0) / quizzes.filter(q => q.avgScore > 0).length || 1)
        : 0;

    // Filtering & Sorting
    const filteredQuizzes = quizzes
        .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.category.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(q => statusFilter === 'all' ? true : q.status === statusFilter)
        .sort((a, b) => {
            if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortOption === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortOption === 'most_responses') return b.attempts - a.attempts;
            if (sortOption === 'highest_avg') return b.avgScore - a.avgScore;
            return 0;
        });

    const toggleSelectQuiz = (id: string) => {
        setSelectedQuizzes(prev => prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedQuizzes.length === filteredQuizzes.length) setSelectedQuizzes([]);
        else setSelectedQuizzes(filteredQuizzes.map(q => q.id));
    };

    const handleDeleteSelected = () => {
        if (confirm(`Are you sure you want to delete ${selectedQuizzes.length} quiz(zes) ? `)) {
            setQuizzes(quizzes.filter(q => !selectedQuizzes.includes(q.id)));
            setSelectedQuizzes([]);
        }
    };

    const handleDeleteQuiz = (id: string) => {
        if (confirm('Are you sure you want to delete this quiz?')) {
            setQuizzes(quizzes.filter(q => q.id !== id));
            setSelectedQuizzes(prev => prev.filter(qId => qId !== id));
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1200px] mx-auto pb-12">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[1.75rem] sm:text-[2rem] font-extrabold text-slate-800 mb-1 leading-tight">My Quizzes</h1>
                        <p className="text-slate-500 text-sm">Manage quizzes you created and view responses</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors text-sm whitespace-nowrap">
                            <ArrowDownToLine size={16} /> Import Quiz
                        </button>
                        <button className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_2px_4px_rgba(79,70,229,0.2)] transition-colors text-sm whitespace-nowrap">
                            <Plus size={16} /> Create New Quiz
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-slate-200 mb-8">
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'created' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Created Quizzes
                    </button>
                    <button
                        onClick={() => setActiveTab('attempted')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'attempted' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        My Results
                    </button>
                </div>

                {activeTab === 'created' ? (
                    <>
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                            <div className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ListFilter size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Total Quizzes</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800">{totalQuizzes}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                    <CheckCircle size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Published</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800">{publishedQuizzes}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Users size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Total Responses</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800">{totalResponses}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                    <BarChart2 size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Avg Score</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800">{avgScoreAll}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Filters & Actions Bar */}
                        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center z-20 relative">

                            {/* Search */}
                            <div className="relative w-full lg:max-w-md">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search quizzes by title or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-hidden focus:border-indigo-400 focus:bg-white transition-colors"
                                />
                            </div>

                            {selectedQuizzes.length > 0 ? (
                                <div className="flex items-center gap-3 w-full lg:w-auto animate-in fade-in slide-in-from-bottom-2">
                                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">{selectedQuizzes.length} selected</span>
                                    <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors">
                                        <CheckCircle size={15} /> Publish
                                    </button>
                                    <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors">
                                        <Download size={15} /> Export
                                    </button>
                                    <button onClick={handleDeleteSelected} className="px-4 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors">
                                        <Trash2 size={15} /> Delete
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Filter size={16} className="text-slate-400 hidden sm:block" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as any)}
                                            className="flex-1 sm:w-auto px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-hidden focus:border-indigo-400 appearance-none min-w-[120px]"
                                        >
                                            <option value="all">Status: All</option>
                                            <option value="published">Status: Published</option>
                                            <option value="draft">Status: Draft</option>
                                        </select>
                                    </div>
                                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value as any)}
                                        className="flex-1 sm:w-auto px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-hidden focus:border-indigo-400 appearance-none min-w-[150px]"
                                    >
                                        <option value="newest">Sort by: Newest</option>
                                        <option value="oldest">Sort by: Oldest</option>
                                        <option value="most_responses">Sort by: Most Responses</option>
                                        <option value="highest_avg">Sort by: Highest Score</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Quiz Grid */}
                        {filteredQuizzes.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {/* Table Header (Desktop only) */}
                                <div className="hidden md:flex items-center px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="w-12 flex items-center justify-center">
                                        <input type="checkbox" checked={selectedQuizzes.length === filteredQuizzes.length && filteredQuizzes.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">Quiz Details</div>
                                    <div className="w-32 text-center">Status</div>
                                    <div className="w-32 text-center">Responses</div>
                                    <div className="w-32 text-center">Avg Score</div>
                                    <div className="w-48 text-right pr-12">Actions</div>
                                </div>

                                {/* Quiz Cards */}
                                {filteredQuizzes.map(quiz => (
                                    <div key={quiz.id} className={`bg-white rounded-[20px] border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 transition-all duration-200 ${selectedQuizzes.includes(quiz.id) ? 'border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]' : 'border-[#e2e8f0] hover:border-indigo-200 hover:shadow-md'}`}>

                                        <div className="hidden md:flex w-6 items-center justify-center shrink-0">
                                            <input type="checkbox" checked={selectedQuizzes.includes(quiz.id)} onChange={() => toggleSelectQuiz(quiz.id)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5 w-full">
                                            <div className="flex items-center justify-between md:hidden w-full mb-1">
                                                <input type="checkbox" checked={selectedQuizzes.includes(quiz.id)} onChange={() => toggleSelectQuiz(quiz.id)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                                                <div className={`px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider ${quiz.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                    {quiz.status}
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-800 truncate">{quiz.title}</h3>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5"><FileText size={14} className="text-indigo-400" /> {quiz.category}</span>
                                                <span className="flex items-center gap-1.5"><ListFilter size={14} /> {quiz.questionCount} Qs</span>
                                                <span className="flex items-center gap-1.5"><Clock size={14} /> {quiz.timeLimit}m</span>
                                                <span className="flex items-center gap-1.5 hidden lg:flex"><Calendar size={14} /> {quiz.createdAt}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge (Desktop) */}
                                        <div className="hidden md:flex w-32 justify-center shrink-0">
                                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${quiz.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                                {quiz.status === 'published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {quiz.status}
                                            </div>
                                        </div>

                                        {/* Stats (Desktop) */}
                                        <div className="hidden md:flex w-32 justify-center shrink-0">
                                            <div className="text-center">
                                                <p className="font-bold text-slate-800">{quiz.attempts}</p>
                                                <p className="text-xs text-slate-400 font-medium">Attempts</p>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex w-32 justify-center shrink-0">
                                            <div className="text-center">
                                                <p className={`font-bold ${quiz.avgScore >= 80 ? 'text-emerald-600' : quiz.avgScore >= 50 ? 'text-amber-500' : 'text-slate-800'}`}>{quiz.avgScore}%</p>
                                                <p className="text-xs text-slate-400 font-medium">Avg Score</p>
                                            </div>
                                        </div>

                                        {/* Mobile Stats (Row) */}
                                        <div className="flex items-center justify-between w-full md:hidden pt-3 border-t border-slate-100">
                                            <div className="flex gap-4">
                                                <div className="text-left">
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Attempts</p>
                                                    <p className="font-bold text-slate-800 text-sm">{quiz.attempts}</p>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Avg Score</p>
                                                    <p className={`font-bold text-sm ${quiz.avgScore >= 80 ? 'text-emerald-600' : quiz.avgScore >= 50 ? 'text-amber-500' : 'text-slate-800'}`}>{quiz.avgScore}%</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/quiz/${quiz.id}/responses`)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="View Responses"><BarChart2 size={18} /></button>
                                                <button className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                                            </div>
                                        </div>

                                        {/* Desktop Actions */}
                                        <div className="hidden md:flex items-center justify-end gap-2 w-48 shrink-0 relative">
                                            <button
                                                onClick={() => navigate(`/quiz/${quiz.id}/responses`)}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-bold text-sm rounded-xl transition-colors"
                                            >
                                                Results
                                            </button>
                                            <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm rounded-xl transition-colors">
                                                Edit
                                            </button>
                                            <div className="relative">
                                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === quiz.id ? null : quiz.id); }} className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                                {/* Dropdown menu */}
                                                {activeDropdown === quiz.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95">
                                                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><Copy size={15} /> Duplicate Quiz</button>
                                                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><Share2 size={15} /> Share Link</button>
                                                        <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><Eye size={15} /> Preview</button>
                                                        <div className="h-px bg-slate-100 my-1"></div>
                                                        <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => handleDeleteQuiz(quiz.id)}><Trash2 size={15} /> Delete Quiz</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-[24px] border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-5 line-dashed">
                                    <BookOpen size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No quizzes found</h3>
                                <p className="text-slate-500 mb-6 max-w-sm">
                                    {searchQuery || statusFilter !== 'all' ? "Try adjusting your filters or search query to find what you're looking for." : "You haven't created any quizzes yet. Start building your first quiz now!"}
                                </p>
                                {searchQuery || statusFilter !== 'all' ? (
                                    <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold transition-colors">
                                        Clear Filters
                                    </button>
                                ) : (
                                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                                        <Plus size={18} /> Create New Quiz
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col gap-4 animate-in fade-in">
                        <div className="hidden md:flex items-center px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="flex-1 min-w-0">Quiz Details</div>
                            <div className="w-32 text-center">Score</div>
                            <div className="w-32 text-center">Status</div>
                            <div className="w-48 text-right pr-12">Actions</div>
                        </div>

                        {mockAttemptedQuizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white rounded-[20px] border border-[#e2e8f0] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                                <div className="flex-1 min-w-0 flex flex-col gap-1.5 w-full">
                                    <div className="flex items-center justify-between md:hidden w-full mb-1">
                                        <div className={`px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider ${quiz.status === 'passed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : quiz.status === 'failed' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                            {quiz.status}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 truncate">{quiz.quizTitle}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5"><FileText size={14} className="text-indigo-400" /> {quiz.category}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> {quiz.timeTaken}m</span>
                                        <span className="flex items-center gap-1.5 hidden lg:flex"><Calendar size={14} /> {quiz.submittedAt}</span>
                                    </div>
                                </div>

                                <div className="hidden md:flex w-32 justify-center shrink-0">
                                    <div className="text-center">
                                        <p className={`font-bold ${quiz.score >= 80 ? 'text-emerald-600' : quiz.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{quiz.score} / {quiz.totalMarks}</p>
                                        <p className="text-xs text-slate-400 font-medium">Score</p>
                                    </div>
                                </div>

                                <div className="hidden md:flex w-32 justify-center shrink-0">
                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${quiz.status === 'passed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : quiz.status === 'failed' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                        {quiz.status === 'passed' ? <CheckCircle size={12} /> : quiz.status === 'failed' ? <X size={12} /> : <Clock size={12} />}
                                        {quiz.status}
                                    </div>
                                </div>

                                {/* Mobile Stats (Row) */}
                                <div className="flex items-center justify-between w-full md:hidden pt-3 border-t border-slate-100">
                                    <div className="text-left">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Score</p>
                                        <p className={`font-bold text-sm ${quiz.score >= 80 ? 'text-emerald-600' : quiz.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{quiz.score} / {quiz.totalMarks}</p>
                                    </div>
                                    <button className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                                </div>

                                <div className="hidden md:flex items-center justify-end gap-2 w-48 shrink-0">
                                    <button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm rounded-xl transition-colors">
                                        View Details
                                    </button>
                                    <button className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout >
    );
};

export default MyQuizzesPage;

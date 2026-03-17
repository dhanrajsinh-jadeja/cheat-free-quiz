import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, Clock, AlertCircle, Play, ArrowLeft, Loader2, Ban, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import { quizService } from '../services/quizService';

const QuizRulesPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quizTitle, setQuizTitle] = useState('Quiz');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attemptStatus, setAttemptStatus] = useState<{
        attemptCount: number;
        maxAttempts: number;
        canAttempt: boolean;
    } | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                const [quizData, status] = await Promise.all([
                    quizService.getQuiz(id),
                    quizService.getAttemptStatus(id)
                ]);
                setQuizTitle(quizData.title);
                setAttemptStatus(status);
            } catch (err: any) {
                setError(err.message || 'Failed to load quiz information');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-xl text-center max-w-[400px]">
                    <AlertCircle className="text-rose-600 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <Button onClick={() => navigate('/profile')} className="w-full bg-indigo-600 text-white">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // ── Attempt limit reached → full blocked screen ────────────────────────────
    if (attemptStatus && !attemptStatus.canAttempt) {
        const isOneAttemptOnly = attemptStatus.maxAttempts === 1;
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="max-w-[480px] w-full bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100">
                    {/* Red top bar */}
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-8 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                            <Ban size={34} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold mb-1">Access Denied</h1>
                        <p className="text-rose-100 text-sm font-medium">{quizTitle}</p>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6">
                            <p className="text-rose-800 font-semibold text-center text-base leading-relaxed">
                                {isOneAttemptOnly
                                    ? 'This quiz allows only one attempt and you have already completed it.'
                                    : `You have used all ${attemptStatus.maxAttempts} allowed attempts for this quiz.`}
                            </p>
                        </div>

                        {/* Attempts used summary */}
                        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 mb-8">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 size={20} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Attempts Used</p>
                                <p className="text-slate-800 font-bold text-lg">
                                    {attemptStatus.attemptCount}
                                    <span className="text-slate-400 font-medium text-sm ml-1">
                                        / {attemptStatus.maxAttempts === 0 ? '∞' : attemptStatus.maxAttempts}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} /> Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Rules page ─────────────────────────────────────────────────────────────
    const rules = [
        {
            icon: <Clock className="text-indigo-600" size={24} />,
            title: 'Strict Time Limit',
            description: 'Once started, the timer cannot be paused. Ensure you have a stable connection.'
        },
        {
            icon: <ShieldAlert className="text-rose-600" size={24} />,
            title: 'Proctoring Enabled',
            description: 'Switching tabs, minimizing the browser, or opening new windows will trigger an automatic submission.'
        },
        {
            icon: <AlertCircle className="text-amber-600" size={24} />,
            title: 'No Backtrack',
            description: 'You cannot go back once the quiz is submitted. Review your answers before the timer ends.'
        },
    ];

    if (attemptStatus && attemptStatus.maxAttempts > 0) {
        rules.push({
            icon: <AlertCircle className="text-indigo-600" size={24} />,
            title: 'Attempt Limit',
            description: `You have used ${attemptStatus.attemptCount} of ${attemptStatus.maxAttempts} attempt${attemptStatus.maxAttempts > 1 ? 's' : ''}. ${attemptStatus.maxAttempts - attemptStatus.attemptCount} remaining.`
        });
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="max-w-[800px] w-full bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row">
                {/* Side Info */}
                <div className="bg-indigo-600 md:w-[300px] p-8 text-white flex flex-col">
                    <button
                        onClick={() => navigate('/profile')}
                        className="mb-12 flex items-center gap-2 text-indigo-100 hover:text-white transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>

                    <div className="mt-auto">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <ShieldAlert size={28} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Exam Mode</h2>
                        <p className="text-indigo-100 leading-relaxed text-sm">
                            This quiz is protected by QuizMaster Proctoring. All activity is monitored to ensure a fair testing environment.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12">
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{quizTitle}</h1>
                        <p className="text-slate-500 font-medium">Please review the instructions below before starting your exam.</p>
                    </div>

                    <div className="space-y-8 mb-12">
                        {rules.map((rule, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                    {rule.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-1">{rule.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{rule.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 mb-10">
                        <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                        <p className="text-amber-800 text-sm font-medium">
                            By clicking "Start Quiz", you agree to the rules. Any detected breach will result in immediate disqualification.
                        </p>
                    </div>

                    <Button
                        className="w-full py-4 text-lg rounded-2xl flex items-center justify-center gap-3 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 transition-all"
                        onClick={() => navigate(`/quiz/take/${id}`)}
                    >
                        <Play size={22} fill="currentColor" />
                        Start Quiz Now
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuizRulesPage;

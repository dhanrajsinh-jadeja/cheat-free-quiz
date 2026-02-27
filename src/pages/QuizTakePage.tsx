import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import { quizService } from '../services/quizService';

interface Question {
    id: string;
    text: string;
    image: string | null;
    options: string[];
    isMultiCorrect: boolean;
}

const QuizTakePage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showCheatWarning, setShowCheatWarning] = useState(false);
    const [answers, setAnswers] = useState<Record<string, number[]>>({});
    const [quizInfo, setQuizInfo] = useState({ title: 'Quiz' });
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                const data = await quizService.getQuiz(id);
                setQuestions(data.questions as any);
                setQuizInfo(data as any);
                setTimeLeft(data.timeLimit * 60);
            } catch (err: any) {
                setError(err.message || 'Failed to load quiz');
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id]);

    const handleSubmit = useCallback(() => {
        if (isSubmitted) return;
        setIsSubmitted(true);
        // In real app, send answers to backend
        setTimeout(() => {
            navigate('/login');
        }, 5000);
    }, [isSubmitted, navigate]);

    // Proctoring Logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitted && questions.length > 0) {
                setShowCheatWarning(true);
                handleSubmit();
            }
        };

        const handleBlur = () => {
            if (!isSubmitted && questions.length > 0) {
                setShowCheatWarning(true);
                handleSubmit();
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        const handlePopState = (_e: PopStateEvent) => {
            window.history.pushState(null, '', window.location.href);
        };
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [handleSubmit, isSubmitted, questions.length]);

    // Timer Logic
    useEffect(() => {
        if (loading || error || questions.length === 0) return;

        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, handleSubmit, loading, error, questions.length]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (optIdx: number) => {
        if (isSubmitted) return;
        const q = questions[currentIdx];
        const currentAnswers = answers[q.id] || [];

        if (q.isMultiCorrect) {
            const newAnswers = currentAnswers.includes(optIdx)
                ? currentAnswers.filter(idx => idx !== optIdx)
                : [...currentAnswers, optIdx];
            setAnswers({ ...answers, [q.id]: newAnswers });
        } else {
            setAnswers({ ...answers, [q.id]: [optIdx] });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
                    <p className="text-slate-500 font-bold">Loading your exam...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[40px] p-12 max-w-[500px] w-full text-center shadow-2xl">
                    <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle size={48} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Exam Unavailable</h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <Button onClick={() => navigate('/login')} className="w-full bg-indigo-600 text-white py-4 font-bold rounded-2xl">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[40px] p-12 max-w-[500px] w-full text-center shadow-2xl animate-in fade-in zoom-in duration-500">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${showCheatWarning ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {showCheatWarning ? <AlertTriangle size={48} /> : <ShieldCheck size={48} />}
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-4">
                        {showCheatWarning ? 'Quiz Auto-Submitted' : 'Quiz Completed!'}
                    </h2>
                    <p className="text-slate-500 leading-relaxed mb-8">
                        {showCheatWarning
                            ? "A security breach was detected (tab switch or window blur). Your quiz has been submitted automatically."
                            : "Thank you for completing the exam. Your results are being processed."}
                    </p>
                    <div className="text-indigo-600 font-bold text-sm">
                        Redirecting to home page...
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Exam Header */}
            <header className="bg-white border-b border-slate-100 h-20 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                        QM
                    </div>
                    <div>
                        <h1 className="font-extrabold text-slate-800">{quizInfo.title}</h1>
                        <p className="text-[0.7rem] text-slate-400 font-bold uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</p>
                    </div>
                </div>

                <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border ${timeLeft < 300 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'} transition-colors`}>
                    <Clock size={20} />
                    <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100">
                <div
                    className="h-full bg-indigo-600 transition-all duration-500 rounded-r-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-[900px] w-full mx-auto p-6 py-12">
                {questions.length > 0 && currentQuestion ? (
                    <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-sm border border-slate-100">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-8 leading-tight">
                            {currentQuestion.text}
                        </h2>

                        {currentQuestion.image && (
                            <div className="mb-10 rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                                <img src={currentQuestion.image} alt="Question" className="max-w-full mx-auto" />
                            </div>
                        )}

                        <div className="space-y-4">
                            {currentQuestion.options.map((opt, idx) => {
                                const isSelected = (answers[currentQuestion.id] || []).includes(idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-6 rounded-[24px] border-2 transition-all duration-300 flex items-center gap-4 group ${isSelected
                                            ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100'
                                            : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-lg transition-colors ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                            {opt}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white rounded-[40px] shadow-sm animate-pulse">
                        <p className="text-slate-400 font-bold">No questions available for this exam.</p>
                    </div>
                )}
            </main>

            {/* Footer Navigation */}
            <footer className="bg-white border-t border-slate-100 p-6 md:p-8 sticky bottom-0 z-10">
                <div className="max-w-[900px] mx-auto flex items-center justify-between">
                    <Button
                        variant="outline"
                        className={`flex items-center gap-2 px-8 ${currentIdx === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                        onClick={() => setCurrentIdx(prev => prev - 1)}
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </Button>

                    {currentIdx === questions.length - 1 ? (
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl font-extrabold text-lg shadow-lg shadow-emerald-100 transition-all hover:-translate-y-1 active:translate-y-0"
                            onClick={handleSubmit}
                        >
                            Complete Quiz
                        </Button>
                    ) : (
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-extrabold text-lg flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1 active:translate-y-0"
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                        >
                            Next Question
                            <ChevronRight size={20} />
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default QuizTakePage;

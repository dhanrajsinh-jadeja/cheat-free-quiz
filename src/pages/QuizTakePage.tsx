import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Loader2, Flag, Monitor, Info, CheckCircle2, X } from 'lucide-react';
import { quizService } from '../services/quizService';

interface Question {
    id: string;
    text: string;
    image: string | null;
    options: string[];
    isMultiCorrect: boolean;
    marks: number;
    originalOptionsIndices?: number[];
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
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [proctoringViolations, setProctoringViolations] = useState(0);
    const [startTime, setStartTime] = useState<string | null>(null);

    // Fisher-Yates (Knuth) Shuffle Algorithm
    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                const data = await quizService.getQuiz(id);
                setQuizInfo(data as any);
                setTimeLeft(data.timeLimit * 60);

                // Implement Shuffling Logic while preserving original indices
                let processedQuestions = data.questions.map((q: any) => {
                    // Create an array of { text, originalIdx } to track after shuffle
                    const optionsWithIndices = q.options.map((text: string, idx: number) => ({ text, originalIdx: idx }));
                    const shuffledOptions = shuffleArray<{ text: string; originalIdx: number }>(optionsWithIndices);
                    
                    return {
                        ...q,
                        id: q._id, // Ensure we use _id as id
                        options: shuffledOptions.map((o: { text: string; originalIdx: number }) => o.text),
                        originalOptionsIndices: shuffledOptions.map((o: { text: string; originalIdx: number }) => o.originalIdx)
                    };
                });

                // Shuffle the entire question list
                processedQuestions = shuffleArray(processedQuestions);

                setQuestions(processedQuestions);
                setStartTime(new Date().toISOString());
            } catch (err: any) {
                setError(err.message || 'Failed to load quiz');
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id]);

    const handleSubmit = useCallback(async () => {
        if (isSubmitted || !id) return;
        setIsSubmitted(true);
        
        try {
            // Map answers to backend format using original indices
            const formattedAnswers = questions.map(q => {
                const selectedShuffledIndices = answers[q.id] || [];
                const selectedOriginalIndices = selectedShuffledIndices.map(shuffledIdx => q.originalOptionsIndices![shuffledIdx]);
                
                return {
                    questionId: q.id,
                    selectedOptions: selectedOriginalIndices
                };
            });

            await quizService.submitQuiz(id, formattedAnswers, proctoringViolations, startTime || new Date().toISOString());
            
            // Navigate to Dashboard after short delay
            setTimeout(() => {
                navigate('/profile');
            }, 3000);
        } catch (err: any) {
            // Error handled with state for UI display
            setError(err.message || "Failed to submit results. Please contact support.");
            setIsSubmitted(false);
        }
    }, [isSubmitted, id, questions, answers, proctoringViolations, startTime, navigate]);

    // Proctoring Logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitted && questions.length > 0) {
                setProctoringViolations(prev => prev + 1);
                setShowCheatWarning(true);
                handleSubmit();
            }
        };

        const handleBlur = () => {
            if (!isSubmitted && questions.length > 0) {
                setProctoringViolations(prev => prev + 1);
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

    const toggleFlag = () => {
        const newFlags = new Set(flaggedQuestions);
        if (newFlags.has(currentIdx)) newFlags.delete(currentIdx);
        else newFlags.add(currentIdx);
        setFlaggedQuestions(newFlags);
    };

    const handleClearResponse = () => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [questions[currentIdx].id]: [] });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-4">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Monitor className="text-primary animate-pulse" size={32} />
                    </div>
                </div>
                <p className="mt-8 text-text-muted font-bold tracking-[0.2em] uppercase text-sm">Initializing Secure Environment</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg-light flex items-center justify-center p-6">
                <div className="bg-white rounded-[40px] p-12 max-w-[500px] w-full text-center border border-border-color shadow-2xl">
                    <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
                        <AlertTriangle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-text-dark mb-4">Access Denied</h2>
                    <p className="text-text-muted mb-10 leading-relaxed font-medium">{error}</p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="w-full bg-primary text-white py-4 font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-bg-light flex items-center justify-center p-6">
                <div className="bg-white rounded-[48px] p-12 max-w-[580px] w-full text-center border border-border-color shadow-2xl animate-in fade-in zoom-in duration-700">
                    <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl transform hover:scale-110 transition-transform ${showCheatWarning ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`}>
                        {showCheatWarning ? <AlertTriangle size={48} /> : <CheckCircle2 size={48} />}
                    </div>
                    <h2 className="text-4xl font-black text-text-dark mb-6 tracking-tight">
                        {showCheatWarning ? 'Session Terminated' : 'Mission Accomplished'}
                    </h2>
                    <p className="text-text-muted leading-relaxed mb-10 text-lg font-medium mx-auto max-w-sm">
                        {showCheatWarning
                            ? "A security violation was detected. Your responses have been locked and submitted for review."
                            : "Your assessment has been securely received. Our proctors will verify the session shortly."}
                    </p>
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-[progress_5s_linear_forward]"></div>
                        </div>
                        <p className="text-primary font-bold text-xs uppercase tracking-[0.3em] animate-pulse">
                            Finalizing Redirect
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-text-dark font-sans selection:bg-primary/10 flex overflow-hidden">
            {/* Sidebar Navigator - Dark Theme for Proctoring Focus */}
            <aside className="hidden lg:flex w-80 bg-bg-dark flex-col p-8 z-20 relative text-text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                        <Monitor className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h2 className="font-black text-white tracking-tight">Secure Exam</h2>
                        <div className="flex items-center gap-2 text-[0.6rem] text-text-muted font-bold uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            Live Monitoring
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Question Matrix</h3>
                            <span className="text-[0.65rem] font-bold text-blue-400">{answeredCount}/{questions.length} Done</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {questions.map((_, idx) => {
                                const isAnswered = !!answers[questions[idx].id];
                                const isCurrent = currentIdx === idx;
                                const isFlagged = flaggedQuestions.has(idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIdx(idx)}
                                        className={`h-11 rounded-xl font-bold text-sm transition-all duration-300 relative group
                                            ${isCurrent ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-110 z-10' : 
                                              isAnswered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                              'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10 hover:text-white'}
                                        `}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0f172a]"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-[24px] p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/20 text-primary rounded-lg"><Info size={16} /></div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instructions</h4>
                        </div>
                        <p className="text-[0.7rem] text-text-muted leading-relaxed font-medium">
                            Answered questions are highlighted in emerald. Use the flag to mark questions for review.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative z-10 w-full overflow-y-auto">
                {/* Exam Header */}
                <header className="h-[70px] px-8 md:px-12 flex items-center justify-between sticky top-0 bg-white border-b border-border-color z-30 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="lg:hidden flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">QM</div>
                        </div>
                        <div className="max-w-[300px] md:max-w-md">
                            <h1 className="font-extrabold text-text-dark text-lg md:text-xl truncate tracking-tight">{quizInfo.title}</h1>
                            <div className="flex items-center gap-3 text-[0.65rem] text-[#94a3b8] font-bold uppercase tracking-[0.1em]">
                                <span>Module {currentIdx + 1}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-primary">{Math.round(progress)}% Progress</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`group flex items-center gap-3 pl-5 pr-6 py-2.5 rounded-2xl border transition-all duration-500 
                            ${timeLeft < 60 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 
                              timeLeft < 300 ? 'bg-amber-50 border-amber-200 text-amber-600' : 
                              'bg-indigo-50 border-indigo-100 text-primary'}
                        `}>
                            <Clock size={20} />
                            <span className="font-mono text-xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </header>

                {/* Progress Strip */}
                <div className="h-1.5 w-full bg-slate-100 relative">
                    <div
                        className="h-full bg-primary transition-all duration-1000 relative shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-r-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Question Spotlight */}
                <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 lg:p-20 overflow-y-auto">
                    <div className="max-w-4xl w-full my-auto">
                        {questions.length > 0 && currentQuestion ? (
                            <div className="bg-white rounded-[40px] p-8 md:p-16 border border-border-color shadow-xl animate-in slide-in-from-bottom-6 fade-in duration-700">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-8 md:mb-12">
                                    <h2 className="text-xl md:text-4xl font-extrabold text-text-dark leading-[1.3] md:leading-[1.2] tracking-tight flex-1">
                                        {currentQuestion.text}
                                    </h2>
                                    <div className="flex gap-2 shrink-0">
                                        <button 
                                            onClick={handleClearResponse}
                                            className="p-3 md:p-4 rounded-2xl md:rounded-3xl border border-border-color text-text-muted hover:border-slate-300 hover:text-text-dark hover:bg-slate-50 transition-all font-bold text-xs md:text-sm flex items-center gap-2"
                                            title="Clear Selection"
                                        >
                                            <X size={18} />
                                            <span className="inline">Clear</span>
                                        </button>
                                        <button 
                                            onClick={toggleFlag}
                                            className={`p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all duration-300 flex items-center gap-2 md:gap-3 font-bold text-xs md:text-sm
                                                ${flaggedQuestions.has(currentIdx) 
                                                    ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-lg shadow-rose-100' 
                                                    : 'bg-white border-border-color text-text-muted hover:border-slate-300 hover:text-text-dark hover:bg-slate-50'}
                                            `}
                                        >
                                            <Flag size={18} className={flaggedQuestions.has(currentIdx) ? 'fill-rose-500' : ''} />
                                            <span className="inline">Flag</span>
                                        </button>
                                    </div>
                                </div>

                                {currentQuestion.image && (
                                    <div className="mb-12 rounded-[32px] overflow-hidden border border-border-color shadow-sm group">
                                        <img src={currentQuestion.image} alt="Question Resource" className="max-w-full mx-auto group-hover:scale-[1.02] transition-transform duration-700" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {currentQuestion.options.map((opt, idx) => {
                                        if (!opt || opt.trim() === '') return null;
                                        const isSelected = (answers[currentQuestion.id] || []).includes(idx);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(idx)}
                                                className={`group relative text-left p-4 md:p-8 rounded-2xl md:rounded-[32px] border-2 transition-all duration-300 flex flex-col gap-2 md:gap-4
                                                    ${isSelected ? 'bg-primary/5 border-primary shadow-lg shadow-blue-500/10 -translate-y-0.5 md:-translate-y-1' : 
                                                      'bg-white border-border-color hover:border-slate-300 hover:bg-slate-50'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3 md:gap-4 z-10">
                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500
                                                        ${isSelected ? 'bg-primary text-white shadow-lg shadow-blue-300' : 'bg-slate-100 text-[#94a3b8] group-hover:bg-slate-200 group-hover:text-slate-600'}
                                                    `}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className={`text-base md:text-xl transition-colors duration-500 ${isSelected ? 'text-text-dark font-extrabold' : 'text-slate-600 font-semibold'}`}>
                                                        {opt}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-20 bg-white rounded-[48px] border border-border-color shadow-inner animate-pulse">
                                <Loader2 className="animate-spin text-slate-200 mx-auto mb-6" size={64} />
                                <p className="text-[#94a3b8] font-bold tracking-widest uppercase">Syncing Exam Buffer...</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Bottom Navigation */}
                <footer className="h-20 md:h-28 px-4 md:px-12 bg-white border-t border-border-color flex items-center justify-center sticky bottom-0 z-30 transition-all">
                    <div className="max-w-4xl w-full flex items-center justify-between gap-4">
                        <button
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                            className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all
                                ${currentIdx === 0 ? 'opacity-0 pointer-events-none' : 'text-text-muted hover:text-text-dark bg-slate-100 hover:bg-slate-200'}
                            `}
                        >
                            <ChevronLeft size={20} />
                            <span className="hidden xs:inline">PREVIOUS</span>
                            <span className="xs:hidden">PREV</span>
                        </button>

                        <div className="hidden md:flex items-center gap-2">
                            {questions.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`h-1.5 rounded-full transition-all duration-500 
                                        ${currentIdx === idx ? 'w-8 bg-primary shadow-lg shadow-blue-200' : 'w-2 bg-slate-200'}
                                    `}
                                />
                            ))}
                        </div>

                        {currentIdx === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3"
                            >
                                <ShieldCheck size={20} />
                                SUBMIT
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                className="bg-primary hover:bg-blue-700 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3"
                            >
                                NEXT
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};


export default QuizTakePage;


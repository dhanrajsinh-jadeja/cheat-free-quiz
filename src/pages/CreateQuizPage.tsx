import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, CheckCircle, Clock, Layout, Copy, X, ExternalLink, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';
import { quizService } from '../services/quizService';

interface Question {
    id: string;
    text: string;
    image: string | null;
    options: string[];
    isMultiCorrect: boolean;
    correctAnswers: number[]; // Array to support multiple correct answers
    marks: number;
}

const CreateQuizPage: React.FC = () => {
    const [quizInfo, setQuizInfo] = useState({
        title: '',
        description: '',
        category: 'General',
        timeLimit: 30
    });

    const [isPublishing, setIsPublishing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [defaultMarks, setDefaultMarks] = useState(1);
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: '1',
            text: '',
            image: null,
            options: ['', '', '', ''],
            isMultiCorrect: false,
            correctAnswers: [0],
            marks: 1
        }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            image: null,
            options: ['', '', '', ''],
            isMultiCorrect: false,
            correctAnswers: [0],
            marks: defaultMarks
        }]);
    };

    const removeQuestion = (id: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                // If switching to single correct, only keep the first correct answer
                if (field === 'isMultiCorrect' && value === false) {
                    return { ...q, [field]: value, correctAnswers: [q.correctAnswers[0] || 0] };
                }
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    const updateOption = (qId: string, optIdx: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[optIdx] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const toggleCorrectAnswer = (qId: string, optIdx: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                if (q.isMultiCorrect) {
                    const newCorrect = q.correctAnswers.includes(optIdx)
                        ? q.correctAnswers.filter(idx => idx !== optIdx)
                        : [...q.correctAnswers, optIdx];
                    return { ...q, correctAnswers: newCorrect.length > 0 ? newCorrect : [optIdx] };
                } else {
                    return { ...q, correctAnswers: [optIdx] };
                }
            }
            return q;
        }));
    };

    const handleImageUpload = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateQuestion(qId, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const applyDefaultMarksToAll = () => {
        setQuestions(questions.map(q => ({ ...q, marks: defaultMarks })));
    };

    const handlePublish = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Create the quiz first
            const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 0), 0);
            const quizData = {
                ...quizInfo,
                questions,
                totalMarks,
                passingMarks: Math.ceil(totalMarks * 0.4) // Default 40% passing
            };

            const createdQuiz = await quizService.createQuiz(quizData);

            // 2. Publish it immediately
            const publishResult = await quizService.publishQuiz(createdQuiz.id || (createdQuiz as any)._id);

            setPublishedUrl(publishResult.quizLink);
            setExpiresAt(new Date(publishResult.expiresAt).toLocaleString());
            setIsPublishing(true);
        } catch (err: any) {
            setError(err.message || 'Failed to publish quiz');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (publishedUrl) {
            navigator.clipboard.writeText(publishedUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 0), 0);

    return (
        <DashboardLayout>
            <div className="max-w-[1000px] mx-auto">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h1 className="text-[1.75rem] sm:text-[2rem] font-extrabold text-text-dark mb-2">Create New Quiz</h1>
                        <p className="text-[#64748b] text-sm sm:base">Design your quiz by adding questions and setting preferences.</p>
                    </div>
                    <Button
                        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handlePublish}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                        {loading ? 'Publishing...' : 'Publish Quiz'}
                    </Button>
                </header>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Publish Modal Overlay */}
                {isPublishing && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[24px] w-full max-w-[500px] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                            <button
                                onClick={() => setIsPublishing(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Quiz Published!</h2>
                                <p className="text-slate-500 mt-2">Your quiz is now live and ready for students.</p>
                                <div className="mt-4 px-4 py-2 bg-amber-50 rounded-lg inline-block">
                                    <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">Link Expires At</p>
                                    <p className="text-amber-900 font-mono text-sm">{expiresAt}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-500 mb-2 block">Quiz Link</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 text-sm truncate font-medium">
                                            {publishedUrl}
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className={`px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copySuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                }`}
                                        >
                                            {copySuccess ? <CheckCircle size={18} /> : <Copy size={18} />}
                                            {copySuccess ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                <a
                                    href={publishedUrl || '/'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-4 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-colors"
                                >
                                    <ExternalLink size={18} />
                                    Preview Quiz
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
                    {/* Main Editor */}
                    <div className="flex flex-col gap-6 lg:gap-8 order-2 lg:order-1">
                        {/* Quiz Info Card */}
                        <div className="bg-white p-6 sm:p-8 rounded-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#e2e8f0]">
                            <h3 className="text-[1.1rem] sm:text-[1.2rem] font-bold mb-6 flex items-center gap-3">
                                <Layout size={20} className="text-primary" /> Quiz Basics
                            </h3>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.9rem] font-semibold text-[#475569]">Quiz Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Modern Web Development"
                                        value={quizInfo.title}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
                                        className="p-3 px-4 rounded-xl border border-[#e2e8f0] outline-hidden transition-colors focus:border-primary w-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.9rem] font-semibold text-[#475569]">Description</label>
                                    <textarea
                                        placeholder="What is this quiz about?"
                                        value={quizInfo.description}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
                                        className="p-3 px-4 rounded-xl border border-[#e2e8f0] outline-hidden min-h-[100px] resize-y transition-colors focus:border-primary w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Questions Header */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-[1.2rem] sm:text-[1.4rem] font-bold text-text-dark">Questions ({questions.length})</h3>
                            <button
                                onClick={addQuestion}
                                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl font-semibold text-primary cursor-pointer transition-all hover:bg-white/5 active:scale-95 text-sm sm:text-base"
                            >
                                <Plus size={18} /> Add Question
                            </button>
                        </div>

                        {/* Question Cards */}
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white p-6 sm:p-8 rounded-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#e2e8f0] relative">
                                <div className="absolute top-6 right-6 flex gap-3 items-center">
                                    <div className="flex items-center gap-2 bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-[#e2e8f0]">
                                        <span className="text-[0.75rem] font-bold text-[#64748b]">Multi Correct</span>
                                        <input
                                            type="checkbox"
                                            checked={q.isMultiCorrect}
                                            onChange={(e) => updateQuestion(q.id, 'isMultiCorrect', e.target.checked)}
                                            className="w-4 h-4 accent-primary cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#f1f5f9] px-3 py-1.5 rounded-lg">
                                        <span className="text-[0.75rem] font-bold text-[#64748b]">Marks:</span>
                                        <input
                                            type="number"
                                            value={q.marks}
                                            onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value) || 0)}
                                            className="w-10 border-none bg-transparent outline-hidden text-[0.85rem] font-bold text-primary text-center"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="border-none bg-[#fee2e2] text-[#ef4444] p-2 rounded-lg cursor-pointer hover:bg-[#fecaca] transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mb-6 mr-40 sm:mr-64">
                                    <span className="text-[0.8rem] sm:text-[0.85rem] font-extrabold text-primary uppercase block mb-2">
                                        Question {idx + 1}
                                    </span>
                                    <div className="flex flex-col gap-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter your question here..."
                                                value={q.text}
                                                onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                                className="w-full p-3 sm:p-4 text-[1rem] sm:text-[1.1rem] font-medium rounded-xl border border-[#e2e8f0] outline-hidden focus:border-primary transition-colors pr-12"
                                            />
                                            <label className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-primary hover:text-primary/80 transition-colors">
                                                <Plus size={20} />
                                                <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(q.id, e)} />
                                            </label>
                                        </div>

                                        {q.image && (
                                            <div className="relative inline-block w-fit group">
                                                <img src={q.image} alt="Question" className="max-w-full max-h-[300px] rounded-xl border border-[#e2e8f0] shadow-sm" />
                                                <button
                                                    onClick={() => updateQuestion(q.id, 'image', null)}
                                                    className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {q.options.map((opt, optIdx) => {
                                        const isCorrect = q.correctAnswers.includes(optIdx);
                                        return (
                                            <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isCorrect ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
                                                <input
                                                    type={q.isMultiCorrect ? "checkbox" : "radio"}
                                                    name={`correct-${q.id}`}
                                                    checked={isCorrect}
                                                    onChange={() => toggleCorrectAnswer(q.id, optIdx)}
                                                    className="w-5 h-5 accent-emerald-500 cursor-pointer flex-shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${optIdx + 1}`}
                                                    value={opt}
                                                    onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                    className="border-none bg-transparent w-full outline-hidden text-[0.9rem] sm:text-[0.95rem] focus:ring-0"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Settings */}
                    <div className="flex flex-col gap-6 order-1 lg:order-2">
                        <div className="bg-white p-6 rounded-[20px] border border-[#e2e8f0] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] lg:sticky lg:top-8">
                            <h4 className="text-base font-bold mb-5 text-text-dark">Settings</h4>

                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.85rem] font-semibold text-[#64748b]">Category</label>
                                    <select
                                        value={quizInfo.category}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, category: e.target.value })}
                                        className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] outline-hidden focus:border-primary transition-colors w-full"
                                    >
                                        <option>General</option>
                                        <option>Programming</option>
                                        <option>Design</option>
                                        <option>Marketing</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.85rem] font-semibold text-[#64748b]">Time Limit (mins)</label>
                                    <div className="relative w-full">
                                        <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type="number"
                                            value={quizInfo.timeLimit}
                                            onChange={(e) => setQuizInfo({ ...quizInfo, timeLimit: parseInt(e.target.value) || 0 })}
                                            className="w-full py-3 pl-10 pr-3 rounded-xl border border-[#e2e8f0] outline-hidden focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-[#f1f5f9] pt-5">
                                    <label className="text-[0.85rem] font-semibold text-[#64748b] mb-2 block">Default Marks per Question</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={defaultMarks}
                                            onChange={(e) => setDefaultMarks(parseInt(e.target.value) || 0)}
                                            className="w-full p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] outline-hidden focus:border-primary transition-colors"
                                        />
                                        <button
                                            onClick={applyDefaultMarksToAll}
                                            className="px-3 bg-primary/10 text-primary rounded-xl font-bold text-[0.75rem] whitespace-nowrap hover:bg-primary/20 transition-colors"
                                        >
                                            Apply All
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-[#64748b] text-[0.85rem]">
                                    <CheckCircle size={16} /> Total Marks: <span className="font-bold text-primary">{totalMarks}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[#64748b] text-[0.85rem]">
                                    <HelpCircle size={16} /> Total Questions: {questions.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateQuizPage;

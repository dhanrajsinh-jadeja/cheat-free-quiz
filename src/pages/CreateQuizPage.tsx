import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, CheckCircle, Clock, Layout } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

const CreateQuizPage: React.FC = () => {
    const [quizInfo, setQuizInfo] = useState({
        title: '',
        description: '',
        category: 'General',
        timeLimit: 30
    });

    const [questions, setQuestions] = useState<Question[]>([
        { id: '1', text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        }]);
    };

    const removeQuestion = (id: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
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

    return (
        <DashboardLayout>
            <div className="max-w-[900px] mx-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-[2rem] font-extrabold text-text-dark mb-2">Create New Quiz</h1>
                        <p className="text-[#64748b]">Design your quiz by adding questions and setting preferences.</p>
                    </div>
                    <Button className="w-auto px-8 py-3">Publish Quiz</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
                    {/* Main Editor */}
                    <div className="flex flex-col gap-8">
                        {/* Quiz Info Card */}
                        <div className="bg-white p-8 rounded-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#e2e8f0]">
                            <h3 className="text-[1.2rem] font-bold mb-6 flex items-center gap-3">
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
                                        className="p-3 px-4 rounded-xl border border-[#e2e8f0] outline-hidden transition-colors focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.9rem] font-semibold text-[#475569]">Description</label>
                                    <textarea
                                        placeholder="What is this quiz about?"
                                        value={quizInfo.description}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
                                        className="p-3 px-4 rounded-xl border border-[#e2e8f0] outline-hidden min-h-[100px] resize-y transition-colors focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Questions Header */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-[1.4rem] font-bold text-text-dark">Questions ({questions.length})</h3>
                            <button
                                onClick={addQuestion}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl font-semibold text-primary cursor-pointer transition-all hover:bg-white/5 active:scale-95"
                            >
                                <Plus size={18} /> Add Question
                            </button>
                        </div>

                        {/* Question Cards */}
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white p-8 rounded-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-[#e2e8f0] relative">
                                <div className="absolute top-6 right-6 flex gap-2">
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="border-none bg-[#fee2e2] text-[#ef4444] p-2 rounded-lg cursor-pointer hover:bg-[#fecaca] transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <span className="text-[0.85rem] font-extrabold text-primary uppercase mb-2 block">
                                        Question {idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Enter your question here..."
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                        className="w-full p-4 text-[1.1rem] font-medium rounded-xl border border-[#e2e8f0] outline-hidden focus:border-primary transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-center gap-3 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                                            <input
                                                type="radio"
                                                name={`correct-${q.id}`}
                                                checked={q.correctAnswer === optIdx}
                                                onChange={() => updateQuestion(q.id, 'correctAnswer', optIdx)}
                                                className="w-5 h-5 accent-[#22c55e]"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Option ${optIdx + 1}`}
                                                value={opt}
                                                onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                className="border-none bg-transparent w-full outline-hidden text-[0.95rem]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Settings */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-[20px] border border-[#e2e8f0] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <h4 className="text-base font-bold mb-5 text-text-dark">Settings</h4>

                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.85rem] font-semibold text-[#64748b]">Category</label>
                                    <select
                                        value={quizInfo.category}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, category: e.target.value })}
                                        className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] outline-hidden focus:border-primary transition-colors"
                                    >
                                        <option>General</option>
                                        <option>Programming</option>
                                        <option>Design</option>
                                        <option>Marketing</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[0.85rem] font-semibold text-[#64748b]">Time Limit (mins)</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type="number"
                                            value={quizInfo.timeLimit}
                                            onChange={(e) => setQuizInfo({ ...quizInfo, timeLimit: parseInt(e.target.value) })}
                                            className="w-full py-3 pl-10 pr-3 rounded-xl border border-[#e2e8f0] outline-hidden focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-[#64748b] text-[0.85rem]">
                                    <CheckCircle size={16} /> Saved as Draft
                                </div>
                                <div className="flex items-center gap-3 text-[#64748b] text-[0.85rem]">
                                    <HelpCircle size={16} /> Questions: {questions.length}
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

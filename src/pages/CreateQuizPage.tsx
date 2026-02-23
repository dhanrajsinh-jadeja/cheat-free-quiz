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
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Create New Quiz</h1>
                        <p style={{ color: '#64748b' }}>Design your quiz by adding questions and setting preferences.</p>
                    </div>
                    <Button style={{ width: 'auto', padding: '0.8rem 2rem' }}>Publish Quiz</Button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                    {/* Main Editor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Quiz Info Card */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '20px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Layout size={20} color="var(--primary)" /> Quiz Basics
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Quiz Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Modern Web Development"
                                        value={quizInfo.title}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
                                        style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', transition: 'border-color 0.3s' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Description</label>
                                    <textarea
                                        placeholder="What is this quiz about?"
                                        value={quizInfo.description}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
                                        style={{ padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', minHeight: '100px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Questions Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-dark)' }}>Questions ({questions.length})</h3>
                            <button
                                onClick={addQuestion}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
                                    backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
                                    fontWeight: '600', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.3s'
                                }}
                            >
                                <Plus size={18} /> Add Question
                            </button>
                        </div>

                        {/* Question Cards */}
                        {questions.map((q, idx) => (
                            <div key={q.id} style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '20px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #e2e8f0',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                                        Question {idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Enter your question here..."
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '500', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <input
                                                type="radio"
                                                name={`correct-${q.id}`}
                                                checked={q.correctAnswer === optIdx}
                                                onChange={() => updateQuestion(q.id, 'correctAnswer', optIdx)}
                                                style={{ width: '20px', height: '20px', accentColor: '#22c55e' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Option ${optIdx + 1}`}
                                                value={opt}
                                                onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Settings */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--text-dark)' }}>Settings</h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Category</label>
                                    <select
                                        value={quizInfo.category}
                                        onChange={(e) => setQuizInfo({ ...quizInfo, category: e.target.value })}
                                        style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none' }}
                                    >
                                        <option>General</option>
                                        <option>Programming</option>
                                        <option>Design</option>
                                        <option>Marketing</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Time Limit (mins)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Clock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="number"
                                            value={quizInfo.timeLimit}
                                            onChange={(e) => setQuizInfo({ ...quizInfo, timeLimit: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#64748b', fontSize: '0.85rem' }}>
                                    <CheckCircle size={16} /> Saved as Draft
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#64748b', fontSize: '0.85rem' }}>
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

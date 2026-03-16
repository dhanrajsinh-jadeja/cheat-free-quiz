import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, BookOpen, Clock, Award, Camera, Edit2, Check, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';
import { User, UserStats } from '../types';
import { authService } from '../services/authService';
import { quizService } from '../services/quizService';
import { Loader2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        avatar: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, statsData] = await Promise.all([
                    authService.getProfile(),
                    quizService.getUserStats()
                ]);
                
                setUser(profileData);
                setStats(statsData);
                setEditForm({
                    fullName: profileData.fullName,
                    email: profileData.email,
                    avatar: profileData.avatar || '',
                });
            } catch (error) {
                console.error('Failed to fetch profile or stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = () => {
        if (!user) return;
        setUser({
            ...user,
            fullName: editForm.fullName,
            email: editForm.email,
            avatar: editForm.avatar,
        });
        setIsEditing(false);
        // Note: In a real app, you'd also call an API to save these changes to the DB.
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </DashboardLayout>
        );
    }

    if (!user || !stats) return null;

    return (
        <DashboardLayout>
            <div className="max-w-[1000px] mx-auto space-y-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-blue-600 to-indigo-700 opacity-10"></div>

                    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
                        {/* Avatar Section */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={64} className="text-slate-300" />
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors border border-slate-100">
                                <Camera size={20} />
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <h1 className="text-3xl font-extrabold text-slate-800">{user.fullName}</h1>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-slate-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <Mail size={18} className="text-slate-400" />
                                    {user.email}
                                </div>
                                <div className="hidden sm:block w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-slate-400" />
                                    Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant={isEditing ? "outline" : "primary"}
                                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                className="flex items-center gap-2"
                            >
                                {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
                            </Button>
                        </div>
                    </div>

                    {/* Edit Form (Expands if isEditing) */}
                    {isEditing && (
                        <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all outline-hidden"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all outline-hidden"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Avatar URL</label>
                                <input
                                    type="text"
                                    value={editForm.avatar}
                                    placeholder="https://example.com/photo.jpg"
                                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all outline-hidden"
                                />
                            </div>
                            <div className="md:col-span-2 pt-4 flex justify-end">
                                <Button onClick={handleSave} className="flex items-center gap-2 px-8">
                                    <Check size={20} /> Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Quizzes</p>
                            <h3 className="text-2xl font-extrabold text-slate-800">{stats.totalQuizzesTaken}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Avg. Score</p>
                            <h3 className="text-2xl font-extrabold text-slate-800">{stats.averageScore}%</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Topics</p>
                            <h3 className="text-2xl font-extrabold text-slate-800">{stats.completedTopics}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase">Streak</p>
                            <h3 className="text-2xl font-extrabold text-slate-800">4 Days</h3>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold text-slate-800">Recent Activity</h2>
                            <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity) => (
                                    <div key={activity.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-indigo-600 uppercase">
                                                {activity.category ? activity.category[0] : 'Q'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{activity.title}</h4>
                                                <p className="text-sm text-slate-500">
                                                    {activity.category || 'General'} • {new Date(activity.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-black ${activity.percentage >= 90 ? 'text-emerald-500' : 'text-slate-800'}`}>
                                                {activity.score}/{activity.totalMarks}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-slate-50 p-12 rounded-[32px] text-center border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">No recent activity found. Start taking quizzes today!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Achievements/Sidebar */}
                    <div className="space-y-6">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-extrabold text-slate-800">Achievements</h2>
                            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center text-white">
                                        <Award size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Quiz Maven</h4>
                                        <p className="text-sm text-slate-500">First 10 quizzes done</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 opacity-50 grayscale">
                                    <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                                        <Award size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Perfect Score</h4>
                                        <p className="text-sm text-slate-500">Get 100% on a quiz</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 opacity-50 grayscale">
                                    <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                                        <Award size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Persistent Learner</h4>
                                        <p className="text-sm text-slate-500">7 day quiz streak</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quiz History Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-extrabold text-slate-800">Quiz History</h3>
                            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                                {stats.attemptHistory && stats.attemptHistory.length > 0 ? (
                                    stats.attemptHistory.map((attempt) => (
                                        <div key={attempt.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-bold text-slate-800 text-sm line-clamp-1">{attempt.title}</h5>
                                                <span className={`text-xs font-black ${attempt.percentage >= 80 ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                    {attempt.percentage}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <span>{attempt.category || 'General'}</span>
                                                <span>{new Date(attempt.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-sm py-4">No attempts yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;

import React, { useState } from 'react';
import { Mail, User, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.signUp(formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle={
                <>
                    Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </>
            }
        >
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[0.95rem] font-medium text-text-white">Full name</label>
                    <Input
                        icon={User}
                        type="text"
                        placeholder="John Doe"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[0.95rem] font-medium text-text-white">Email address</label>
                    <Input
                        icon={Mail}
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[0.95rem] font-medium text-text-white">Password</label>
                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create account'}
                </Button>

                <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-border-color"></div>
                    <span className="flex-shrink mx-4 text-text-muted text-[0.85rem]">Or continue with</span>
                    <div className="flex-grow border-t border-border-color"></div>
                </div>

                <div className="flex justify-center w-full">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            if (credentialResponse.credential) {
                                try {
                                    setLoading(true);
                                    await authService.googleLogin(credentialResponse.credential);
                                    navigate('/profile');
                                } catch (err: any) {
                                    setError(err.message || 'Google Sign up failed');
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        onError={() => {
                            setError('Google Sign up failed');
                        }}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                        width="100%"
                    />
                </div>
            </form>
        </AuthLayout>
    );
};

export default SignUpPage;

import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';

const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.login(formData);
            navigate('/profile');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Sign in to your account"
            subtitle={
                <>
                    Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up for free</Link>
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
                    <div className="flex justify-between items-center">
                        <label className="text-[0.95rem] font-medium text-text-white">Password</label>
                        <Link to="/forgot-password" className="text-[0.85rem] text-primary hover:underline">Forgot your password?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" size={20} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-input-bg border border-border-color rounded-lg py-4 pl-12 pr-4 text-text-white text-base outline-hidden transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-blue-500/20"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Sign in'}
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
                                    setError(err.message || 'Google Login failed');
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        onError={() => {
                            setError('Google Login failed');
                        }}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                        width="100%"
                    />
                </div>
            </form>

            <div className="text-center mt-12 text-text-muted text-[0.85rem] select-none">
                <p>© 2026 Passwd Generator Inc. All rights reserved.</p>
            </div>
        </AuthLayout>
    );
};

export default SignInPage;

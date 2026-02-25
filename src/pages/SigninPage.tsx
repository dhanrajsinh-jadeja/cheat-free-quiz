import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

const SignInPage: React.FC = () => {
    return (
        <AuthLayout
            title="Sign in to your account"
            subtitle={
                <>
                    Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up for free</Link>
                </>
            }
        >
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-2">
                    <label className="text-[0.95rem] font-medium text-text-white">Email address</label>
                    <Input icon={Mail} type="email" placeholder="you@example.com" required />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[0.95rem] font-medium text-text-white">Password</label>
                        <a href="#" className="text-[0.85rem] text-primary hover:underline">Forgot your password?</a>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-input-bg border border-border-color rounded-lg py-4 px-4 text-text-white text-base outline-hidden transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-blue-500/20"
                        required
                    />
                </div>

                <Button type="submit">Sign in</Button>

                <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-border-color"></div>
                    <span className="flex-shrink mx-4 text-text-muted text-[0.85rem]">Or continue with</span>
                    <div className="flex-grow border-t border-border-color"></div>
                </div>

                <button className="flex items-center justify-center gap-3 w-full p-4 bg-input-bg border border-border-color rounded-lg text-text-white font-semibold hover:bg-white/5 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </button>
            </form>

            <div className="text-center mt-12 text-text-muted text-[0.85rem] select-none">
                <p>© 2026 Passwd Generator Inc. All rights reserved.</p>
            </div>
        </AuthLayout>
    );
};

export default SignInPage;

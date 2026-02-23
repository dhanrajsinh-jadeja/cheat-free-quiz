import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import RoleSelector from '../components/RoleSelector';

const LoginPage: React.FC = () => {
    const [role, setRole] = useState<'student' | 'admin'>('student');

    return (
        <AuthLayout
            title="Login Account"
            subtitle="Welcome back! Please enter your details to access your quiz dashboard and start learning."
        >
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={(e) => e.preventDefault()}>
                <Input icon={User} type="text" placeholder="Username" required />
                <Input icon={Lock} type="password" placeholder="Password" required />

                <RoleSelector value={role} onChange={setRole} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                        Save Password
                    </label>
                    <a href="#" style={{ color: 'var(--text-white)', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</a>
                </div>

                <Button type="submit">Login Account</Button>
            </form>

            <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Don't Have an Account?</span>
            </div>

            <Link to="/signup" style={{ textDecoration: 'none', marginBottom: '1rem', display: 'block' }}>
                <Button variant="outline">Create Account</Button>
            </Link>

            <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                <Link to="/create-quiz" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                    Go to Create Quiz (Admin)
                </Link>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;

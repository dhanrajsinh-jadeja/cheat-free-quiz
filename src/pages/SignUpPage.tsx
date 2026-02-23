import React, { useState } from 'react';
import { User, Mail, Lock, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import RoleSelector from '../components/RoleSelector';

const SignUpPage: React.FC = () => {
    const [role, setRole] = useState<'student' | 'admin'>('student');

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join our community of learners and educators. Start your journey with the most interactive quiz platform."
        >
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} onSubmit={(e) => e.preventDefault()}>
                <Input icon={UserCircle} type="text" placeholder="Full Name" required />
                <Input icon={Mail} type="email" placeholder="Email Address" required />
                <Input icon={User} type="text" placeholder="Username" required />
                <Input icon={Lock} type="password" placeholder="Password" required />

                <RoleSelector value={role} onChange={setRole} />

                <Button type="submit" style={{ marginTop: '0.8rem' }}>Create Account</Button>
            </form>

            <div style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Already Have an Account?</span>
            </div>

            <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="outline">Back to Login</Button>
            </Link>
        </AuthLayout>
    );
};

export default SignUpPage;

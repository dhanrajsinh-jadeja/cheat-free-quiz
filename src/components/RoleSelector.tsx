import React from 'react';

interface RoleSelectorProps {
    value: 'student' | 'admin';
    onChange: (value: 'student' | 'admin') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Login As:</label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                    <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={value === 'student'}
                        onChange={() => onChange('student')}
                        style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '1rem', color: 'var(--text-white)' }}>Student</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                    <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={value === 'admin'}
                        onChange={() => onChange('admin')}
                        style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '1rem', color: 'var(--text-white)' }}>Admin</span>
                </label>
            </div>
        </div>
    );
};

export default RoleSelector;

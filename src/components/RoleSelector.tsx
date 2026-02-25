import React from 'react';

interface RoleSelectorProps {
    value: 'student' | 'admin';
    onChange: (value: 'student' | 'admin') => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
    return (
        <div className="flex flex-col gap-3 mt-2">
            <label className="text-[0.9rem] text-text-muted">Login As:</label>
            <div className="flex gap-6">
                <label className="flex items-center cursor-pointer gap-2">
                    <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={value === 'student'}
                        onChange={() => onChange('student')}
                        className="accent-primary w-[18px] h-[18px]"
                    />
                    <span className="text-base text-text-white">Student</span>
                </label>
                <label className="flex items-center cursor-pointer gap-2">
                    <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={value === 'admin'}
                        onChange={() => onChange('admin')}
                        className="accent-primary w-[18px] h-[18px]"
                    />
                    <span className="text-base text-text-white">Admin</span>
                </label>
            </div>
        </div>
    );
};

export default RoleSelector;

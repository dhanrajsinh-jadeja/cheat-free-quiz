import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon;
}

const Input: React.FC<InputProps> = ({ icon: Icon, ...props }) => {
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                {...props}
                style={{
                    width: '100%',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1rem 1rem 1rem 3.2rem',
                    color: 'var(--text-white)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
            <Icon
                size={20}
                style={{
                    position: 'absolute',
                    left: '1.2rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default Input;

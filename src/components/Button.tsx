import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, style, ...props }) => {
    const isPrimary = variant === 'primary';

    return (
        <button
            {...props}
            style={{
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: isPrimary ? 'none' : '1px solid var(--border-color)',
                backgroundColor: isPrimary ? 'var(--primary)' : 'transparent',
                color: isPrimary ? 'white' : 'var(--text-white)',
                width: '100%',
                ...style
            }}
            onMouseOver={(e) => {
                if (isPrimary) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                } else {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
            }}
            onMouseOut={(e) => {
                if (isPrimary) {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            {children}
        </button>
    );
};

export default Button;

import React from 'react';
import { ShieldCheck, CircleDollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="container">
            {/* Left Section: Form */}
            <div style={{
                flex: 1,
                backgroundColor: 'var(--bg-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                color: 'var(--text-white)'
            }}>
                <div style={{ maxWidth: '400px', width: '100%' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.025em' }}>
                        {title}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                        {subtitle}
                    </p>
                    {children}
                </div>
            </div>

            {/* Right Section: Branding */}
            <div className="brand-section" style={{
                flex: 1.2,
                backgroundColor: '#f1f5f9',
                padding: '4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: '600px', width: '100%' }}>
                    <div style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '4rem' }}>
                        {/* Floating Cards (simplified representation in JS for now, using CSS for animation) */}
                        <div className="floating-card secure" style={{ top: '12%', left: '0%' }}>
                            <div className="icon-circle orange"><ShieldCheck size={18} /></div>
                            <span style={{ fontWeight: '500', color: 'var(--text-dark)' }}>Secure Data</span>
                        </div>
                        <div className="floating-card payment" style={{ top: '35%', left: '-8%' }}>
                            <div className="icon-circle green"><CircleDollarSign size={18} /></div>
                            <span style={{ fontWeight: '500', color: 'var(--text-dark)' }}>Easy Payment</span>
                        </div>
                        <div className="floating-card growth" style={{ bottom: '25%', right: '5%' }}>
                            <div className="icon-circle yellow"><TrendingUp size={18} /></div>
                            <span style={{ fontWeight: '500', color: 'var(--text-dark)' }}>Fast Growing</span>
                        </div>

                        {/* Mockups */}
                        <div className="mockup-browser">
                            <div className="browser-header">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', height: '100%' }}></div>
                        </div>

                        <div className="mockup-phone">
                            <div className="phone-screen">
                                <div className="check-container">
                                    <CheckCircle2 size={32} />
                                </div>
                            </div>
                            <div className="phone-button"></div>
                        </div>
                    </div>

                    <div className="why-us">
                        <h2>Why Join Us</h2>
                        <p>Experience the most interactive and data-driven quiz platform. Track your progress, compete with peers, and master new skills effortlessly.</p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .floating-card {
            position: absolute;
            background: rgba(255, 255, 255, 0.7);
            padding: 1rem 1.8rem;
            border-radius: 16px;
            display: flex;
            align-items: center;
            gap: 1.2rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 10;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            animation: float 5s ease-in-out infinite;
        }
        .icon-circle {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .orange { background: linear-gradient(135deg, #fb923c, #f97316); }
        .green { background: linear-gradient(135deg, #4ade80, #22c55e); }
        .yellow { background: linear-gradient(135deg, #facc15, #eab308); }
        
        .mockup-browser {
            width: 320px;
            height: 220px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            position: absolute;
            top: 8%;
            right: 8%;
            overflow: hidden;
        }
        .browser-header {
            background: #f1f5f9;
            padding: 0.8rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            gap: 8px;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ff5f56; }
        .dot.yellow { background: #ffbd2e; }
        .dot.green { background: #27c93f; }
        
        .mockup-phone {
            width: 170px;
            height: 340px;
            background: #475569;
            border-radius: 32px;
            position: absolute;
            bottom: 8%;
            left: 45%;
            padding: 14px;
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
            border: 2px solid #64748b;
        }
        .phone-screen {
            background: #ffffff;
            height: 100%;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }
        .check-container {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #60a5fa, #3b82f6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
        }
        .phone-button {
            width: 45px; height: 5px; background: #334155;
            position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); border-radius: 3px;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
        }
        
        .why-us h2 { font-size: 2.2rem; font-weight: 800; color: var(--text-dark); margin-bottom: 1.2rem; letter-spacing: -0.025em; }
        .why-us p { color: #475569; line-height: 1.7; font-size: 1.1rem; }
      ` }} />
        </div>
    );
};

export default AuthLayout;

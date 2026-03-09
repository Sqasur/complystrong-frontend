import React, { useState } from 'react';

const HumanVerification = ({ onVerified }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const handleVerify = () => {
        if (isVerified || isVerifying) return;
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);
            if (onVerified) onVerified(true);
        }, 1200);
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f9f9f9',
                border: '1px solid #d3d3d3',
                borderRadius: '3px',
                padding: '12px 16px',
                maxWidth: '304px',
                width: '100%',
                boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
                cursor: isVerified || isVerifying ? 'default' : 'pointer',
                userSelect: 'none',
            }}
            onClick={handleVerify}
        >
            {/* Left: Checkbox + Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '3px',
                        border: isVerified ? 'none' : '2px solid #c1c1c1',
                        background: isVerified ? 'transparent' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                    }}
                >
                    {isVerifying ? (
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                border: '3px solid #4285f4',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }}
                        />
                    ) : isVerified ? (
                        <svg width="30" height="30" viewBox="0 0 30 30">
                            <path
                                d="M5 14 L12 21 L25 6"
                                fill="none"
                                stroke="#4285f4"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    strokeDasharray: 40,
                                    strokeDashoffset: 0,
                                    animation: 'checkDraw 0.4s ease forwards',
                                }}
                            />
                        </svg>
                    ) : null}
                </div>
                <span
                    style={{
                        fontSize: '14px',
                        color: '#555',
                        fontWeight: 400,
                        fontFamily: 'Roboto, Arial, sans-serif',
                    }}
                >
                    I'm not a robot
                </span>
            </div>

            {/* Right: reCAPTCHA branding */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/ad/RecaptchaLogo.svg"
                    alt="reCAPTCHA"
                    style={{ width: '32px', height: '32px' }}
                />
                <span
                    style={{
                        fontSize: '7px',
                        fontWeight: 700,
                        color: '#9b9b9b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: 'Roboto, Arial, sans-serif',
                    }}
                >
                    Readiness Core
                </span>
            </div>

            {/* Inline keyframes */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes checkDraw {
                    from { stroke-dashoffset: 40; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
};

export default HumanVerification;

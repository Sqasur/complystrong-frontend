import React, { useState, useEffect } from 'react';

const HumanVerification = ({ onVerified }) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const handleVerify = () => {
        if (isVerified || isVerifying) return;

        setIsVerifying(true);
        // Simulate a slight delay for a premium feel
        setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);
            if (onVerified) onVerified(true);
        }, 1200);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm max-w-full sm:max-w-[320px] transition-all hover:border-indigo-200 group">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerified || isVerifying}
                    className={`w-8 h-8 rounded-md border-2 transition-all flex items-center justify-center
                        ${isVerified
                            ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-100'
                            : 'bg-white border-slate-200 group-hover:border-indigo-300'
                        }
                        ${isVerifying ? 'scale-95' : 'scale-100'}
                    `}
                >
                    {isVerifying ? (
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : isVerified ? (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : null}
                </button>
                <span className={`text-sm font-bold tracking-tight transition-all
                    ${isVerified ? 'text-emerald-600' : 'text-slate-600 group-hover:text-slate-900'}
                `}>
                    I'm not a robot
                </span>
            </div>

            <div className="flex flex-col items-center">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/ad/RecaptchaLogo.svg"
                    alt="reCAPTCHA"
                    className={`w-6 h-6 grayscale opacity-30 transition-all ${isVerified ? 'grayscale-0 opacity-100' : ''}`}
                />
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1">Radinas Core</span>
            </div>
        </div>
    );
};

export default HumanVerification;

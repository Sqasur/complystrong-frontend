import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100] animate-slideUp">
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-8 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)]">
                {}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>

                <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                <path d="M12 12L15 15" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="15.5" cy="8.5" r=".5" fill="currentColor" />
                                <circle cx="11.5" cy="15.5" r=".5" fill="currentColor" />
                                <circle cx="8.5" cy="10.5" r=".5" fill="currentColor" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">We value your privacy</h3>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-8">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking <span className="font-bold text-slate-900">"Accept All"</span>, you consent to our use of cookies.
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAccept}
                            className="flex-1 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all duration-300"
                        >
                            Accept All
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="px-6 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-300"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp {
                    animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default CookieConsent;
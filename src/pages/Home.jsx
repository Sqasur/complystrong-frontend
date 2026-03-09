import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import HumanVerification from '../components/HumanVerification';

const Home = () => {
    const navigate = useNavigate();
    const [certifications, setCertifications] = useState([]);
    const [selectedCert, setSelectedCert] = useState('');
    const [timeline, setTimeline] = useState('');
    const [loading, setLoading] = useState(true);
    const [isHuman, setIsHuman] = useState(false);
    const [hasConsented, setHasConsented] = useState(!!localStorage.getItem('cookieConsent'));

    useEffect(() => {
        const checkConsent = () => setHasConsented(!!localStorage.getItem('cookieConsent'));
        window.addEventListener('storage', checkConsent);
        return () => window.removeEventListener('storage', checkConsent);
    }, []);

    useEffect(() => {
        const fetchCerts = async () => {
            const data = await apiService.getCertifications();
            setCertifications(data);
            setLoading(false);
        };
        fetchCerts();
    }, []);

    const handleStart = (e) => {
        e.preventDefault();
        if (!selectedCert || !timeline) return;
        navigate(`/wizard?cert=${selectedCert}&timeline=${timeline}`);
    };

    const timelines = [
        {
            value: '<30',
            label: 'Under 30 days',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
            )
        },
        {
            value: '30-90',
            label: '30 to 90 days',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            )
        },
        {
            value: '>90',
            label: 'More than 90 days',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                </svg>
            )
        },
    ];

    if (!isHuman) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center text-center">


                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Verification Required</h1>
                    <p className="text-slate-400 text-sm mb-8 max-w-[280px]">
                        Please confirm you are human to access the Readiness Compliance Portal.
                    </p>

                    {/* reCAPTCHA widget */}
                    <HumanVerification onVerified={() => setIsHuman(true)} />


                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-40">
                {/* Left: Logo */}
                <div className="flex items-center">
                    <div className="group cursor-pointer" onClick={() => window.location.assign('https://complystrong.com/')}>
                        <div className="w-24 sm:w-28 h-10 sm:h-12 flex items-center justify-start transition-transform duration-500 overflow-hidden hover:scale-105">
                            <img
                                src="https://complystrong.com/wp-content/uploads/2025/12/logo_compliance_program.png"
                                alt="Readiness Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Center: Home Link (Responsive centering via flex-grow and absolute Positioning) */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <button
                        onClick={() => window.location.assign('https://complystrong.com/')}
                        className="text-[#1e293b] font-medium text-sm sm:text-base border-b-2 border-transparent hover:border-blue-500 pb-1 px-0.5 transition-all"
                    >
                        Home
                    </button>
                </div>

                {/* Right: Empty for spacing */}
                <div className="w-24 sm:w-28"></div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
                <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <div className="flex flex-col items-center lg:items-start mb-6">
                            <div className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-[#0066cc] rounded-full shadow-sm shadow-[#0066cc]/30">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <span className="text-[11px] sm:text-sm font-black text-white uppercase tracking-widest whitespace-nowrap">Free 3-Minute Audit Assessment</span>
                            </div>
                        </div>
                        <div className="mb-6 flex flex-col items-center lg:items-start">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight lg:leading-none">
                                Audit <span className="text-indigo-600">Readiness</span>
                            </h1>
                        </div>
                        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                            Get an instant gap analysis and priority action list for your next compliance audit. Simple, fast, and actionable.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                            <div className="flex items-center space-x-2 text-slate-500 text-sm">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span>Instant Results</span>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-500 text-sm">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span>Priority Gap List</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-100">
                        <form onSubmit={handleStart} className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                                    SELECT CERTIFICATION PROGRAM
                                </label>
                                <select
                                    value={selectedCert}
                                    onChange={(e) => setSelectedCert(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Choose a standard...</option>
                                    {certifications.map((cert) => (
                                        <option key={cert._id} value={cert._id}>
                                            {cert.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                                    WHEN IS YOUR AUDIT?
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {timelines.map((t) => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setTimeline(t.value)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${timeline === t.value
                                                ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                                                : 'border-slate-100 bg-white hover:border-slate-200'
                                                }`}
                                        >
                                            <span className="text-2xl mb-2">{t.icon}</span>
                                            <span className="text-[10px] font-black uppercase text-center leading-tight">
                                                {t.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Explicit Cookie Consent Option */}
                            {!hasConsented && (
                                <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">Cookie Preference</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                            We use cookies to enhance your experience. By clicking "Start Assessment", you accept our use of cookies.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                localStorage.setItem('cookieConsent', 'true');
                                                window.dispatchEvent(new Event('storage')); // Notify all components
                                                setHasConsented(true);
                                            }}
                                            className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            Accept All Cookies Now
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!selectedCert || !timeline}
                                className="w-full bg-[#0066cc] text-white rounded-2xl py-5 font-black text-lg uppercase tracking-widest shadow-lg shadow-[#0066cc]/30 hover:bg-[#0052a3] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Start Assessment
                            </button>
                        </form>
                    </div>
                </div>

                <footer className="mt-12 text-slate-400 text-sm font-medium">
                    © 2026 Audit Readiness. Professional Grade Compliance Tools. | Powered by Comply Strong
                </footer>
            </div>


        </div>
    );
};

export default Home;

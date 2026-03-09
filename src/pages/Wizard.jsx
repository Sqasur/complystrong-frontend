import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import ProgressBar from '../components/common/ProgressBar';
import QuestionCard from '../components/wizard/QuestionCard';

const Wizard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const certId = searchParams.get('cert');
    const timeline = searchParams.get('timeline');

    const [certification, setCertification] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadData, setLeadData] = useState(() => {
        const saved = localStorage.getItem('leadData');
        return saved ? JSON.parse(saved) : { name: '', company: '', email: '', phone: '' };
    });
    const [hasConsented, setHasConsented] = useState(!!localStorage.getItem('cookieConsent'));

    useEffect(() => {
        const checkConsent = () => setHasConsented(!!localStorage.getItem('cookieConsent'));
        window.addEventListener('storage', checkConsent);
        return () => window.removeEventListener('storage', checkConsent);
    }, []);

    useEffect(() => {
        if (!certId) {
            navigate('/');
            return;
        }

        const loadData = async () => {
            const data = await apiService.getQuestions(certId);
            setCertification(data.certification);
            setQuestions(data.questions);
            setLoading(false);
        };

        loadData();
    }, [certId, navigate]);

    const handleOptionSelect = (option) => {
        const questionId = questions[currentIndex]._id;
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                questionId,
                selectedOption: option,
            },
        }));

        // Auto-advance to next question or submit if last
        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
        }
    };

    const handleOpenLeadForm = () => {
        setShowLeadForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Save lead data to localStorage for auto-fill in booking
            localStorage.setItem('leadData', JSON.stringify(leadData));

            const result = await apiService.submitAssessment(certId, Object.values(answers), leadData);
            navigate(`/results?id=${result._id}`);
        } catch (error) {
            console.error('Submission failed', error);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Questions...</p>
                </div>
            </div>
        );
    }

    const progress = questions.length > 0 ? ((Object.keys(answers).length) / questions.length) * 100 : 0;
    const isLastQuestion = currentIndex === questions.length - 1;
    const hasAnsweredCurrent = !!answers[questions[currentIndex]._id];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <nav className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20 relative">
                <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-1/3">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <img
                        src="https://complystrong.com/wp-content/uploads/2025/12/logo_compliance_program.png"
                        alt="ComplyStrong"
                        className="h-8 sm:h-10 object-contain"
                    />
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden sm:block w-1/3">
                    <h2 className="text-sm sm:text-base font-black text-black uppercase tracking-widest truncate">{certification?.name}</h2>
                </div>
                <div className="w-1/3 hidden sm:block"></div> {/* Right spacer to balance layout */}
            </nav>

            <div className="flex-1 overflow-y-auto pt-4 pb-4">
                <div className="max-w-2xl mx-auto px-6">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-3 text-xs">
                            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-[11px] sm:text-xs font-bold rounded-[24px] uppercase tracking-widest leading-none flex items-center shadow-md shadow-indigo-100/50">
                                {questions[currentIndex]?.category || 'Documentation'}
                            </span>
                            {/* Cookie Consent Indicator for Wizard */}
                            {!hasConsented && (
                                <button
                                    onClick={() => {
                                        localStorage.setItem('cookieConsent', 'true');
                                        window.dispatchEvent(new Event('storage'));
                                        setHasConsented(true);
                                    }}
                                    className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-white transition-all group"
                                >
                                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accept Cookies</span>
                                </button>
                            )}
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{progress.toFixed(0)}% Complete</span>
                            </div>
                        </div>
                        <ProgressBar progress={progress} />
                    </div>

                    <QuestionCard
                        question={questions[currentIndex]}
                        currentAnswer={answers[questions[currentIndex]._id]?.selectedOption}
                        onOptionSelect={handleOptionSelect}
                    />

                    {/* Footer Navigation */}
                    <div className="mt-4 flex justify-between gap-4">
                        <button
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className="px-6 py-3 rounded-xl font-bold text-black hover:text-gray-700 transition-colors disabled:opacity-0"
                        >
                            Previous
                        </button>

                        {isLastQuestion && hasAnsweredCurrent ? (
                            <button
                                onClick={handleOpenLeadForm}
                                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all text-center"
                            >
                                Finish & See Results
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                                disabled={!hasAnsweredCurrent || isLastQuestion}
                                className="px-6 py-3 rounded-xl font-bold text-black hover:bg-slate-50 transition-all disabled:opacity-0"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {showLeadForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !submitting && setShowLeadForm(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 sm:p-10 animate-fade-in-up border border-slate-100">
                        {/* Close button */}
                        {!submitting && (
                            <button
                                onClick={() => setShowLeadForm(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Almost There!</h3>
                            <p className="text-slate-500 mt-2 text-sm font-medium">Please enter your details to view your personalized assessment results.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={leadData.name}
                                    onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                    placeholder="John Doe"
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Company Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={leadData.company}
                                    onChange={(e) => setLeadData({ ...leadData, company: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                    placeholder="Acme Corp"
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Work Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={leadData.email}
                                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                    placeholder="john@example.com"
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Phone Number <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={leadData.phone}
                                    onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                    placeholder="+1 (555) 000-0000"
                                    disabled={submitting}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-emerald-600 text-white rounded-xl py-3.5 font-bold uppercase tracking-widest mt-6 hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : 'View My Results'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wizard;

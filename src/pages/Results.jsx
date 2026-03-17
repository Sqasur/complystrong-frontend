import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import BookingModal from '../components/BookingModal';

const Results = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get('id');

    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        if (!id) {
            navigate('/');
            return;
        }

        const loadResult = async () => {
            const data = await apiService.getAssessment(id);
            setAssessment(data);
            setLoading(false);
        };

        loadResult();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Analyzing Results...</p>
                </div>
            </div>
        );
    }

    const getTierConfig = (tier) => {
        switch (tier) {
            case 'Green':
                return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: '✅', label: 'Audit Ready' };
            case 'Amber':
                return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: '⚠️', label: 'Gaps Identified' };
            case 'Red':
            default:
                return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: '🚨', label: 'High Risk' };
        }
    };

    const tier = getTierConfig(assessment.tier);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {}
            <div className="bg-white border-b border-slate-100 px-6 py-12">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Assessment Complete</p>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
                        Your Readiness Report
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Based on the requirements for <span className="text-slate-900 font-bold">{assessment.certification.name}</span>
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {}
                    <div className="md:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-slate-50">
                        <div className={`absolute top-0 inset-x-0 h-2 ${tier.color.replace('text', 'bg')}`}></div>
                        <div className={`text-7xl font-black mb-2 ${tier.color}`}>
                            {assessment.score}<span className="text-3xl">%</span>
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">Readiness Score</p>

                        <div className={`inline-flex items-center px-6 py-3 ${tier.bg} ${tier.color} rounded-2xl border ${tier.border} font-black uppercase tracking-widest text-sm`}>
                            <span className="mr-3 text-xl">{tier.icon}</span>
                            {tier.label}
                        </div>
                    </div>

                    {}
                    <div className="bg-slate-900 rounded-3xl p-8 flex flex-col justify-center text-white shadow-xl">
                        <div className="mb-6">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Gaps Found</p>
                            <p className="text-3xl font-black">{assessment.gaps?.length || 0}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Date</p>
                            <p className="text-lg font-bold">
                                {new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {}
                <div className="mt-12">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                        Top Priority Gaps
                        <span className="ml-4 h-px flex-1 bg-slate-200"></span>
                    </h2>

                    <div className="space-y-6">
                        {assessment.gaps && assessment.gaps.length > 0 ? (
                            assessment.gaps.map((gap, idx) => (
                                <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <span className="px-4 py-1.5 bg-gradient-to-r from-[#4f46e5] to-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm shadow-indigo-100">
                                            {gap.category}
                                        </span>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs font-bold text-slate-400">IMPACT WEIGHT</span>
                                            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4f46e5] to-indigo-800 text-white flex items-center justify-center font-black text-xs shadow-xl shadow-indigo-200">
                                                {gap.weight}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                                        {gap.questionText}
                                    </h3>

                                    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                                        <p className="text-sm font-bold text-indigo-900 mb-1 uppercase tracking-tight">Expert Recommendation</p>
                                        <p className="text-indigo-800 leading-relaxed text-sm">
                                            {gap.recommendation}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-green-50 rounded-3xl p-12 text-center border-2 border-dashed border-green-200">
                                <p className="text-3xl mb-4">🎉</p>
                                <p className="text-green-800 font-black uppercase tracking-widest">No major gaps identified!</p>
                                <p className="text-green-600 text-sm mt-2">You are in excellent shape for your upcoming audit.</p>
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="mt-16 bg-white rounded-[2rem] p-10 shadow-2xl shadow-indigo-100 border border-indigo-50 text-center">
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Need help closing these gaps?</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">
                        Our experts can help you implement the required controls in record time. Book a free 15-minute readiness call.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => setIsBookingOpen(true)}
                            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Book Readiness Call
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="bg-slate-100 text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Export PDF Report
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors"
                    >
                        ← Back to start
                    </button>
                </div>
            </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />
        </div>
    );
};

export default Results;
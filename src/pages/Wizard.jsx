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

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const result = await apiService.submitAssessment(certId, Object.values(answers));
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
                        src="https://complystrong.com/wp-content/uploads/2025/12/logo_compliance_program.webp"
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
                            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-[11px] sm:text-xs font-bold rounded-[24px] uppercase tracking-widest leading-none flex items-center shadow-md shadow-emerald-100/50">
                                {questions[currentIndex]?.category || 'Documentation'}
                            </span>
                            <span className="font-bold text-slate-500">{`${Math.round(progress)}% Complete`}</span>
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
                            className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-0"
                        >
                            Previous
                        </button>

                        {isLastQuestion && hasAnsweredCurrent ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all text-center"
                            >
                                {submitting ? 'Calculating...' : 'Finish & See Results'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                                disabled={!hasAnsweredCurrent || isLastQuestion}
                                className="px-6 py-3 rounded-xl font-bold text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-0"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wizard;

import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const BookingModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        type: 'General Assessment',
        name: '',
        email: '',
        phone: ''
    });

    const availableTimeSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
        "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
    ];

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to confirm booking.');
            }
            setStep(3); // Success step
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-indigo-600 p-6 flex items-center justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div>
                        <h2 className="text-2xl font-black mb-1">Book Readiness Call</h2>
                        <p className="text-indigo-100 text-sm font-medium">Free 15-minute expert consultation</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors relative z-10"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Call Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all appearance-none"
                                >
                                    <option>General Assessment</option>
                                    <option>Gap Remediation Plan</option>
                                    <option>Audit Preparation</option>
                                    <option>Pricing & Options</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                                    Available Times {formData.date ? `(${formData.date})` : ''}
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {availableTimeSlots.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            disabled={!formData.date}
                                            onClick={() => setFormData({ ...formData, time: t })}
                                            className={`py-3 px-2 text-sm font-bold rounded-xl border-2 transition-all ${!formData.date
                                                ? 'border-slate-50 bg-slate-50 text-slate-300 cursor-not-allowed'
                                                : formData.time === t
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                                                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-slate-100'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                {!formData.date && (
                                    <p className="text-xs text-slate-400 mt-2 font-medium text-center">
                                        Please select a date to enable time slots
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.date || !formData.time}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                            >
                                Continue to Details →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Jane Doe"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Work Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="jane@company.com"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(555) 123-4567"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.name || !formData.email || !formData.phone || sending}
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Sending...
                                        </>
                                    ) : 'Confirm Booking'}
                                </button>
                            </div>
                            {error && (
                                <p className="text-rose-600 text-sm font-medium text-center mt-2">{error}</p>
                            )}
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Call Confirmed!</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                We've sent a calendar invitation to <strong className="text-slate-900">{formData.email}</strong> for {formData.date} at {formData.time}.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-slate-100 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Back to Results
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;

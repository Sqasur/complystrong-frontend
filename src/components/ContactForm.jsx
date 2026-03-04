import React, { useState } from 'react';

const ContactForm = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || '/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(`${API_BASE}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Message sent! We will get back to you soon.' });
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => {
                    onClose();
                    setStatus({ type: '', message: '' });
                }, 3000);
            } else {
                setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Connectivity issue. Please check your network.' });
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-start overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-fadeInLeft border-r border-slate-50">
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#f0f7ff] text-[#4f46e5] rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-extrabold text-[#334155] tracking-tight">Contact Us</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Custom Input Style to match Sidebar elements */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Your Name</label>
                            <div className="relative group">
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-5 py-3.5 text-sm text-slate-600 font-semibold focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-5 py-3.5 text-sm text-slate-600 font-semibold focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject</label>
                            <input
                                required
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="What's this about?"
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-5 py-3.5 text-sm text-slate-600 font-semibold focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Message</label>
                            <textarea
                                required
                                name="message"
                                rows="6"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Describe your inquiry..."
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-5 py-3.5 text-sm text-slate-600 font-semibold focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none placeholder:text-slate-300"
                            ></textarea>
                        </div>

                        {status.message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    {status.type === 'success' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                <p className="text-xs font-bold uppercase tracking-wider">{status.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#4f46e5] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Wait...
                                </span>
                            ) : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className="p-8 border-t border-slate-50">
                    <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <div className="w-8 h-8 bg-white text-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Team active: Under 2h response</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;

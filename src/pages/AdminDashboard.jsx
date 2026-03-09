import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const statusConfig = {
    pending: { label: 'Pending', bg: 'bg-gradient-to-r from-[#d97706] to-[#fbbf24]', text: 'text-white shadow-sm', border: 'border-[#d97706]', dot: 'bg-white' },
    accepted: { label: 'Accepted', bg: 'bg-gradient-to-r from-[#04785c] to-emerald-600', text: 'text-white shadow-sm', border: 'border-[#04785c]', dot: 'bg-white' },
    rejected: { label: 'Rejected', bg: 'bg-gradient-to-r from-[#c0392b] to-[#e74c3c]', text: 'text-white shadow-sm', border: 'border-[#c0392b]', dot: 'bg-white' },
};

const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
};

const AdminDashboard = () => {
    const [authed, setAuthed] = useState(() => localStorage.getItem('adminAuthed') === 'true');
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('adminUser') || '{}'));
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'analytics', 'users'
    const [assessmentStats, setAssessmentStats] = useState({});
    const [selectedAssessmentType, setSelectedAssessmentType] = useState(null);
    const [selectedDetails, setSelectedDetails] = useState({ assessments: [], dailyTrend: [], monthlyTrend: [] });
    const [trendView, setTrendView] = useState('month'); // 'day' or 'month'
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
    const [editingId, setEditingId] = useState(null);
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'manager', name: '', phone: '' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ id: '', name: '', username: '', password: '', role: 'manager', phone: '' });
    const [userToDelete, setUserToDelete] = useState(null);
    const [settingsForm, setSettingsForm] = useState({ name: '', username: '', email: '', phone: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    const [settingsInfo, setSettingsInfo] = useState({ error: '', success: '', loading: false });
    const [settingsSubTab, setSettingsSubTab] = useState('profile'); // 'profile' or 'password'
    const prevPendingCountRef = useRef(null);

    useEffect(() => {
        if (activeTab === 'settings' && user) {
            setSettingsSubTab('profile');
            setSettingsForm({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setSettingsInfo({ error: '', success: '', loading: false });
        }
    }, [activeTab, user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSettingsInfo({ error: '', success: '', loading: true });

        if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
            setSettingsInfo({ error: 'Passwords do not match', success: '', loading: false });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify(settingsForm),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                setSettingsInfo({ error: '', success: 'Profile updated successfully!', loading: false });
                setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            } else {
                setSettingsInfo({ error: data.error || 'Update failed', success: '', loading: false });
            }
        } catch {
            setSettingsInfo({ error: 'Connection error', success: '', loading: false });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                setAuthed(true);
                setUser(data.user);
                localStorage.setItem('adminAuthed', 'true');
                localStorage.setItem('adminUser', JSON.stringify(data.user));
            } else {
                setLoginError(data.error || 'Invalid username or password');
            }
        } catch {
            setLoginError('Connection error. Please try again.');
        }
    };

    const fetchBookings = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                headers: { 'x-user-role': user.role }
            });
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch {
            setBookings([]);
        }
        if (showLoader) setLoading(false);
    };



    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/users`, {
                headers: { 'x-user-role': user.role }
            });
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            setUsers([]);
        }
    };

    const fetchAssessmentStats = async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/assessments/stats`);
            const data = await res.json();
            if (data && typeof data === 'object') {
                setAssessmentStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch assessment stats:', error);
        }
        if (showLoader) setLoading(false);
    };

    const fetchAssessmentDetails = async (type) => {
        setLoadingDetails(true);
        try {
            const res = await fetch(`${API_BASE}/assessments?certificationName=${encodeURIComponent(type)}`);
            const data = await res.json();
            setSelectedDetails(data);
        } catch (error) {
            console.error('Failed to fetch assessment details:', error);
            setSelectedDetails({ assessments: [], dailyTrend: [], monthlyTrend: [] });
        }
        setLoadingDetails(false);
    };

    useEffect(() => {
        if (selectedAssessmentType) {
            fetchAssessmentDetails(selectedAssessmentType);
        }
    }, [selectedAssessmentType]);

    useEffect(() => {
        if (authed) {
            fetchBookings();
            fetchAssessmentStats(true);
            if (user.role === 'admin') fetchUsers();

            const intervalId = setInterval(() => {
                // Background polling to catch new bookings so notification sounds can play 
                fetchBookings(false);
                fetchAssessmentStats(false);
            }, 10000);

            return () => clearInterval(intervalId);
        }
    }, [authed, user.role]);

    const handleAction = async (id, status, newDate, newTime) => {
        setBookings(prev => prev.map(item => item._id === id ? { ...item, status, date: newDate || item.date, time: newTime || item.time } : item));
        setUpdatingId(id);

        try {
            const body = { status };
            if (newDate) body.date = newDate;
            if (newTime) body.time = newTime;

            const res = await fetch(`${API_BASE}/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': user.role
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                fetchBookings();
            }
        } catch {
            fetchBookings();
        }
        setUpdatingId(null);
        setEditingId(null);
    };

    const handleUserAction = async (id, action, data = {}) => {
        try {
            const method = action === 'delete' ? 'DELETE' : action === 'update' ? 'PATCH' : 'POST';
            const url = action === 'create' ? `${API_BASE}/auth/users` : `${API_BASE}/auth/users/${id}`;
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': user.role
                },
                body: action === 'delete' ? null : JSON.stringify(data),
            });
            if (res.ok) {
                fetchUsers();
                if (action === 'create') setIsAddModalOpen(false);
            }
        } catch {
            console.error('User action failed');
        }
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        handleUserAction(null, 'create', newUser);
        setNewUser({ username: '', password: '', role: 'manager', name: '', phone: '' });
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        const data = {
            name: editForm.name,
            username: editForm.username,
            role: editForm.role,
            phone: editForm.phone
        };
        if (editForm.password) data.password = editForm.password;

        handleUserAction(editForm.id, 'update', data);
        setIsEditModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            handleUserAction(userToDelete._id, 'delete');
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const filtered = (filter === 'all' ? bookings : bookings.filter(b => b.status === filter))
        .filter(b =>
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.phone && b.phone.includes(searchTerm)) ||
            (b.type && b.type.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    const counts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        accepted: bookings.filter(b => b.status === 'accepted').length,
        rejected: bookings.filter(b => b.status === 'rejected').length,
    };

    useEffect(() => {
        if (prevPendingCountRef.current !== null && counts.pending > prevPendingCountRef.current) {
            playNotificationSound();
        }
        prevPendingCountRef.current = counts.pending;
    }, [counts.pending]);

    if (!authed) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

                <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative z-10 border border-white/20">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 transition-transform duration-500">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
                        <p className="text-slate-500 font-medium mt-2">Secure access to audit management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Admin ID"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 pr-12 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-fadeIn">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-semibold">{loginError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                        >
                            Sign In
                        </button>
                    </form>


                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex ${activeTab === 'analytics' ? 'bg-white' : 'bg-[#f8fafc]'} relative`}>
            {/* Sidebar Overlay for Mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden transition-all duration-300"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky top-0 h-screen z-50 transition-all duration-300 ease-in-out
                ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                w-72 bg-white border-r border-slate-100 flex flex-col shrink-0
            `}>
                <div className="p-8 pb-4 text-center">
                    <div className="flex items-center gap-3 group justify-center">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg shadow-slate-200">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">Radinas</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Admin v2.0</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'bookings', label: 'Bookings', icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, badge: counts.pending },
                        { id: 'analytics', label: 'Analytics', icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                        { id: 'users', label: 'Manage Users', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
                        { id: 'settings', label: 'Settings', icon: <><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></> },
                    ].map(item => (
                        <button
                            key={item.id}
                            disabled={item.disabled}
                            onClick={() => { setActiveTab(item.id); setFilter('all'); setShowSidebar(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all group ${activeTab === item.id
                                ? 'bg-indigo-50 text-indigo-600'
                                : item.disabled ? 'opacity-40 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === item.id ? 'bg-white shadow-sm shadow-indigo-100 text-indigo-600' : 'bg-transparent text-slate-400 group-hover:text-slate-600'}`}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    {item.icon}
                                </svg>
                            </div>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    {/* User Profile Card */}
                    <div className="bg-slate-50/50 rounded-3xl p-5 mb-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate">
                                    {user.name || user.username || 'System Admin'}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {user.role === 'admin' ? 'Administrator' : 'Manager'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => { localStorage.removeItem('adminAuthed'); localStorage.removeItem('adminUser'); setAuthed(false); }}
                        className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all group"
                    >
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 group-hover:bg-rose-100 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto h-screen scroll-smooth">
                <div className="bg-white/50 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 py-6 sticky top-0 z-20">
                    <div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h2>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Operational</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Global Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 placeholder:text-slate-300 w-40"
                            />
                        </div>

                        {/* Notification Bell */}
                        <button
                            onClick={() => {
                                setActiveTab('bookings');
                                setFilter('pending');
                            }}
                            className="relative w-12 h-12 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                            title="Pending Bookings"
                        >
                            <svg className={`w-7 h-7 ${counts.pending > 0 ? 'text-[#0ea5e9] animate-[wiggle_1s_ease-in-out_infinite]' : 'text-slate-300'} transition-all`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                            </svg>
                            {counts.pending > 0 && (
                                <span className="absolute top-1 right-1 w-[22px] h-[22px] bg-[#df2626] border-2 border-white rounded-full flex items-center justify-center text-[12px] font-black text-white shadow-sm leading-none" style={{ transform: 'translate(25%, -25%)' }}>
                                    {counts.pending}
                                </span>
                            )}
                        </button>



                        <button
                            onClick={async () => {
                                setIsRefreshing(true);
                                if (activeTab === 'bookings') await fetchBookings(false);
                                else if (activeTab === 'users') await fetchUsers();
                                setIsRefreshing(false);
                            }}
                            disabled={isRefreshing}
                            className={`w-10 h-10 flex items-center justify-center text-[#0ea5e9] transition-all group ${isRefreshing ? 'opacity-80' : 'hover:scale-105 active:scale-95'}`}
                            title="Refresh"
                        >
                            <svg className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-10">
                    {activeTab === 'bookings' ? (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 mb-8 sm:mb-12">
                                {[
                                    { key: 'all', label: 'Overall Request', color: 'indigo', icon: <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
                                    { key: 'pending', label: 'In Review', color: 'amber', icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                                    { key: 'accepted', label: 'Confirmed', color: 'emerald', icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                                    { key: 'rejected', label: 'Declined', color: 'rose', icon: <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                                ].map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => setFilter(s.key)}
                                        className={`group relative bg-white p-4 sm:p-7 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all duration-300 ${filter === s.key ? 'border-indigo-500 ring-2 sm:ring-4 ring-indigo-50 shadow-2xl' : 'border-slate-50 hover:border-slate-100 hover:shadow-xl'}`}
                                    >
                                        <div className="flex items-center justify-between mb-4 sm:mb-8">
                                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${filter === s.key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    {s.icon}
                                                </svg>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xl sm:text-3xl font-black text-slate-900 group-hover:scale-110 transition-transform">{counts[s.key]}</span>
                                                <span className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest sm:mt-1">Live</span>
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-50 mb-3 sm:mb-4"></div>
                                        <p className="text-[10px] sm:text-sm font-extrabold text-[#334155] tracking-tight">{s.label}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
                                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Booking Schedule</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage all appointments</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                                        {['all', 'pending', 'accepted'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setFilter(f)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-20 grayscale opacity-50">
                                        <span className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M20 12H4" strokeWidth={2} strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-300 font-extrabold text-sm uppercase tracking-widest">No entries located in this segment</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-max">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    {['Client Details', 'Contact', 'Schedule', 'Package Type', 'Status', 'Confirm'].map(h => (
                                                        <th key={h} className="text-left px-6 sm:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filtered.map((b) => {
                                                    const s = statusConfig[b.status];
                                                    const isUpdating = updatingId === b._id;
                                                    return (
                                                        <tr key={b._id} className="group hover:bg-slate-50/40 transition-all duration-300">
                                                            <td className="px-10 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs uppercase shadow-sm group-hover:scale-110 transition-transform">
                                                                        {b.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-800 tracking-tight">{b.name}</p>
                                                                        <p className="text-[10px] text-slate-400 font-medium lowercase">UID: {b._id.slice(-6).toUpperCase()}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-6">
                                                                <p className="text-xs font-bold text-slate-600">{b.email}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium mt-1">{b.phone || 'No phone'}</p>
                                                            </td>
                                                            <td className="px-10 py-6 text-xs text-slate-600">
                                                                {editingId === b._id ? (
                                                                    <div className="flex flex-col gap-2">
                                                                        <input
                                                                            type="date"
                                                                            value={editDate}
                                                                            onChange={(e) => setEditDate(e.target.value)}
                                                                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-emerald-400"
                                                                        />
                                                                        <select
                                                                            value={editTime}
                                                                            onChange={(e) => setEditTime(e.target.value)}
                                                                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-emerald-400 appearance-none cursor-pointer"
                                                                        >
                                                                            {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"].map(t => (
                                                                                <option key={t} value={t}>{t}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} /></svg>
                                                                            <span className="font-bold">{b.date}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-slate-400">
                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg>
                                                                            <span className="text-[10px] font-bold">{b.time}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-10 py-6">
                                                                <span className="inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white" style={{ background: 'linear-gradient(135deg, #ff8c00 0%, #ff6200 50%, #e63900 100%)' }}>
                                                                    {b.type}
                                                                </span>
                                                            </td>
                                                            <td className="px-10 py-6">
                                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${s.bg} ${s.text} border ${s.border}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`}></span>
                                                                    {s.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-10 py-6">
                                                                {b.status === 'pending' ? (
                                                                    <div className="flex gap-3">
                                                                        {editingId === b._id ? (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleAction(b._id, 'accepted', editDate, editTime)}
                                                                                    className="w-11 h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 shadow-sm"
                                                                                    title="Save & Confirm"
                                                                                >
                                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingId(null)}
                                                                                    className="w-11 h-11 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200"
                                                                                    title="Cancel"
                                                                                >
                                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleAction(b._id, 'accepted')}
                                                                                    disabled={isUpdating}
                                                                                    className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-emerald-200/50 hover:-translate-y-0.5 transition-all active:scale-95 group shadow-sm shadow-emerald-100"
                                                                                    title="Quick Confirm"
                                                                                >
                                                                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => { setEditingId(b._id); setEditDate(b.date); setEditTime(b.time); }}
                                                                                    disabled={isUpdating}
                                                                                    className="w-11 h-11 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 group"
                                                                                    title="Reschedule & Confirm"
                                                                                >
                                                                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                    </svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleAction(b._id, 'rejected')}
                                                                                    disabled={isUpdating}
                                                                                    className="w-11 h-11 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95 group"
                                                                                    title="Decline Request"
                                                                                >
                                                                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                                    </svg>
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 ${b.status === 'accepted' ? 'bg-indigo-50/30 text-indigo-500 border-indigo-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d={b.status === 'accepted' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            </div>
                        </>
                    ) : activeTab === 'users' ? (
                        user.role !== 'admin' ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                                    <svg className="w-12 h-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Administrative Access Required</h3>
                                <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                                    You are currently logged in with a <span className="text-amber-600 font-bold">Manager</span> role. User Management is restricted to Admin personnel only.
                                </p>
                                <button
                                    onClick={() => { localStorage.removeItem('adminAuthed'); localStorage.removeItem('adminUser'); setAuthed(false); }}
                                    className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg"
                                >
                                    Switch to Admin Account
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="flex items-center justify-between">
                                    <div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
                                        Add New User
                                    </button>
                                </div>


                                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-50">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-max">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    {['Name', 'Email/Username', 'Phone', 'Role', 'Created', 'Actions'].map(h => (
                                                        <th key={h} className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {users.map(u => (
                                                    <tr key={u._id} className="group hover:bg-slate-50/40 transition-all duration-300">
                                                        <td className="px-10 py-6 font-black text-slate-900 text-sm tracking-tight">{u.name}</td>
                                                        <td className="px-10 py-6 text-xs font-bold text-slate-500">{u.username}</td>
                                                        <td className="px-10 py-6 text-xs font-bold text-slate-400">{u.phone || '-'}</td>
                                                        <td className="px-10 py-6">
                                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditForm({
                                                                            id: u._id,
                                                                            name: u.name,
                                                                            username: u.username,
                                                                            password: '',
                                                                            role: u.role,
                                                                            phone: u.phone || ''
                                                                        });
                                                                        setIsEditModalOpen(true);
                                                                    }}
                                                                    className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setUserToDelete(u);
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                    className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-0"
                                                                    disabled={u.username === user.username}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : activeTab === 'settings' ? (
                        <div className="max-w-4xl mx-auto animate-fadeIn">
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="bg-indigo-600 px-10 py-10 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight">Account Settings</h3>
                                                <p className="text-indigo-100 font-bold uppercase tracking-widest text-[9px] mt-1">Personalize your system preferences</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Internal Tabs Selection */}
                                <div className="flex border-b border-slate-100 px-10 bg-slate-50/50">
                                    {[
                                        { id: 'profile', label: 'Personal Information', icon: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
                                        { id: 'password', label: 'Password & Security', icon: <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setSettingsSubTab(tab.id)}
                                            className={`flex items-center gap-3 px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative ${settingsSubTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>{tab.icon}</svg>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <form onSubmit={handleUpdateProfile} className="p-10 space-y-10">
                                    {(settingsInfo.error || settingsInfo.success) && (
                                        <div className={`${settingsInfo.error ? 'bg-rose-50 border-rose-100 text-rose-600 animate-shake' : 'bg-emerald-50 border-emerald-100 text-emerald-600 animate-fadeIn'} border px-6 py-4 rounded-2xl flex items-center gap-3`}>
                                            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                {settingsInfo.error ? (
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                ) : (
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                )}
                                            </svg>
                                            <span className="text-sm font-black">{settingsInfo.error || settingsInfo.success}</span>
                                        </div>
                                    )}

                                    {settingsSubTab === 'profile' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fadeIn">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.name}
                                                    onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                                    required
                                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:bg-white focus:border-indigo-400 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Username / Login ID</label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.username}
                                                    onChange={e => setSettingsForm({ ...settingsForm, username: e.target.value })}
                                                    required
                                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:bg-white focus:border-indigo-400 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={settingsForm.email}
                                                    onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:bg-white focus:border-indigo-400 outline-none transition-all"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.phone}
                                                    onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:bg-white focus:border-indigo-400 outline-none transition-all"
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-fadeIn">
                                            <div className="bg-slate-50/50 p-8 rounded-3xl border border-dotted border-slate-200">
                                                <div className="max-w-md mx-auto space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1 italic decoration-indigo-500/30 underline">Current Password (Required for updates)</label>
                                                        <input
                                                            type="password"
                                                            value={settingsForm.currentPassword}
                                                            onChange={e => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                                                            required={settingsForm.newPassword !== ''}
                                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:border-indigo-400 outline-none transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    <div className="h-px bg-slate-100"></div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">New Password</label>
                                                        <input
                                                            type="password"
                                                            value={settingsForm.newPassword}
                                                            onChange={e => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:border-indigo-400 outline-none transition-all"
                                                            placeholder="Leave blank to keep current"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Confirm New Password</label>
                                                        <input
                                                            type="password"
                                                            value={settingsForm.confirmPassword}
                                                            onChange={e => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-black focus:border-indigo-400 outline-none transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-slate-50">
                                        <button
                                            type="submit"
                                            disabled={settingsInfo.loading}
                                            className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200/50 flex items-center justify-center gap-4 group"
                                        >
                                            {settingsInfo.loading ? (
                                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                <>
                                                    Commit Changes
                                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fadeIn">
                            {!selectedAssessmentType ? (
                                <>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                            <div className="flex items-center justify-between mb-8">
                                                <div><h4 className="font-black text-slate-900">Test Trends</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Completion distribution</p></div>
                                                <div className="text-right"><p className="text-2xl font-black text-slate-900">{Object.values(assessmentStats).reduce((sum, s) => sum + s.count, 0)}</p><p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1 italic">Total Volume</p></div>
                                            </div>
                                            <div className="flex items-end justify-between h-48 gap-4 pt-4">
                                                {[65, 80, 45, 95].map((h, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                                        <div className="w-full bg-indigo-50/50 rounded-xl relative overflow-hidden flex items-end" style={{ height: '100%' }}>
                                                            <div className="w-full bg-indigo-600 rounded-t-xl group-hover:bg-indigo-500 transition-all cursor-pointer" style={{ height: `${h}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{['Q1', 'Q2', 'Q3', 'Q4'][i]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center">
                                            <div className="relative w-40 h-40 mb-10">
                                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle><circle cx="16" cy="16" r="14" fill="transparent" stroke="#4f46e5" strokeWidth="4" strokeDasharray="65 100" strokeDashoffset="0"></circle></svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black text-slate-900">65%</span><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Growth</span></div>
                                            </div>
                                            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Year-over-year adoption metrics across frameworks</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                        <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-8 sm:mb-10">Assessment Delivery Flow</h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                                            {[
                                                { label: 'FSSC 22000', color: 'indigo' },
                                                { label: 'ISO 22000', color: 'blue' },
                                                { label: 'HACCP', color: 'emerald' },
                                                { label: 'ISO 9001', color: 'slate' },
                                                { label: 'GMP/cGMP', color: 'amber' },
                                                { label: 'OHSA', color: 'rose' }
                                            ].map(a => {
                                                const stats = assessmentStats[a.label] || { count: 0, avgScore: 0 };
                                                const totalAssessments = Object.values(assessmentStats).reduce((sum, s) => sum + s.count, 0);
                                                const pct = totalAssessments > 0 ? Math.round((stats.count / totalAssessments) * 100) : 0;
                                                return (
                                                    <div key={a.label} onClick={() => setSelectedAssessmentType(a.label)} className="p-4 sm:p-5 bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group active:scale-95">
                                                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3 line-clamp-1 group-hover:text-indigo-600">{a.label}</p>
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <span className="text-xl sm:text-2xl font-black text-slate-900">{stats.count}</span>
                                                            </div>
                                                            <span className="text-[8px] sm:text-[10px] font-black text-emerald-500">{pct}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between"><div className="flex items-center gap-6"><button onClick={() => setSelectedAssessmentType(null)} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg></button><div><h3 className="text-2xl font-black text-slate-900">{selectedAssessmentType} Detail Analysis</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Granular framework performance</p></div></div></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {(() => {
                                            const stats = assessmentStats[selectedAssessmentType] || { count: 0 };
                                            const totalAssessments = Object.values(assessmentStats).reduce((sum, s) => sum + s.count, 0);
                                            const marketShare = totalAssessments > 0 ? Math.round((stats.count / totalAssessments) * 100) : 0;
                                            return (
                                                <>
                                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Respondents</p>
                                                        <span className="text-4xl font-black text-slate-900">{stats.count}</span>
                                                    </div>
                                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Market Share</p>
                                                        <span className="text-4xl font-black text-slate-900">{marketShare}%</span>
                                                    </div>
                                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Performance</p>
                                                        <span className="text-4xl font-black text-slate-900 italic">High</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">Timeline Adoption Trend</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Completion distribution</p>
                                            </div>
                                            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                                <button
                                                    onClick={() => setTrendView('day')}
                                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trendView === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    By Day
                                                </button>
                                                <button
                                                    onClick={() => setTrendView('month')}
                                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${trendView === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    By Month
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-16 flex items-end justify-between gap-4 pt-6">
                                            {loadingDetails ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : (
                                                ((trendView === 'day' ? selectedDetails?.dailyTrend : selectedDetails?.monthlyTrend) || []).slice(-12).map((item, i) => {
                                                    const trendData = (trendView === 'day' ? selectedDetails?.dailyTrend : selectedDetails?.monthlyTrend) || [];
                                                    const maxCount = Math.max(...trendData.map(d => d.count), 1);
                                                    const h = (item.count / maxCount) * 100;
                                                    const label = trendView === 'day' ? item._id?.split('-')?.slice(1)?.join('/') : item._id?.split('-')?.[1]; // mm/dd or mm
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                                            <div className="w-full bg-slate-50 rounded-lg relative overflow-hidden flex items-end h-full">
                                                                <div className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-violet-400 transition-all duration-500 relative" style={{ height: `${h}%` }}>
                                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                        {item.count} Tests
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label || '??'}</span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                            {(!loadingDetails && ((trendView === 'day' ? selectedDetails?.dailyTrend : selectedDetails?.monthlyTrend) || []).length === 0) && (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold italic">No data available for this range</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Respondents Detail Table */}
                                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Detailed Respondents Report</h4>
                                            <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedDetails.assessments.length} Total</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-slate-50/50">
                                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name / Company</th>
                                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Score & Result</th>
                                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {loadingDetails ? (
                                                        <tr>
                                                            <td colSpan="4" className="px-10 py-20 text-center">
                                                                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                            </td>
                                                        </tr>
                                                    ) : (selectedDetails?.assessments || []).length > 0 ? (
                                                        (selectedDetails?.assessments || []).map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                                <td className="px-10 py-6">
                                                                    <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.contactInfo?.name}</p>
                                                                    <p className="text-xs font-bold text-slate-400">{item.contactInfo?.company}</p>
                                                                </td>
                                                                <td className="px-10 py-6">
                                                                    <p className="text-xs font-bold text-slate-900">{item.contactInfo?.email}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400">{item.contactInfo?.phone}</p>
                                                                </td>
                                                                <td className="px-10 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black text-white ${item.tier === 'Green' ? 'bg-emerald-500' :
                                                                            item.tier === 'Amber' ? 'bg-amber-500' : 'bg-rose-500'
                                                                            }`}>
                                                                            {item.score}%
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-10 py-6">
                                                                    <p className="text-xs font-black text-slate-900">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'N/A'}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-10 py-20 text-center text-slate-400 font-bold italic">No respondents found for this framework</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 border border-slate-100 overflow-hidden animate-slideIn">
                        <div className="bg-blue-600 px-10 py-8 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Modify System Access</h3>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all font-bold">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button type="submit" className="flex-1 bg-slate-900 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                                    Commit Changes
                                </button>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 bg-slate-100 text-slate-400 rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 border border-slate-100 overflow-hidden animate-slideIn">
                        <div className="bg-blue-600 px-10 py-8 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Add New User</h3>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all font-bold">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={newUser.phone}
                                        onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                                    Create User
                                </button>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 bg-slate-100 text-slate-400 rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 border border-slate-100 overflow-hidden animate-slideIn">
                        <div className="bg-blue-600 px-8 py-6 text-white text-center">
                            <h3 className="text-xl font-black tracking-tight">System Security</h3>
                        </div>
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <svg className="w-10 h-10 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 text-rose-500 italic">Terminating Access</h3>
                            <p className="text-slate-500 font-medium leading-relaxed italic">Are you absolutely certain you want to revoke system privileges for <span className="font-black text-slate-900">{userToDelete?.username}</span>? This action is irreversible.</p>

                            <div className="mt-10 flex flex-col gap-4">
                                <button onClick={handleConfirmDelete} className="w-full bg-rose-600 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">
                                    Confirm Termination
                                </button>
                                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-slate-100 text-slate-400 rounded-2xl py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                                    Abort
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { authAPI } from '../services/api';

export default function Auth({ onAuthSuccess, onOfflineMode }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            if (isLogin) {
                response = await authAPI.login(formData.email, formData.password);
            } else {
                response = await authAPI.register(formData.email, formData.password, formData.name);
            }

            // Call success callback
            onAuthSuccess(response);
        } catch (err) {
            console.error('Auth error:', err);
            const errorMsg = err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Authentication failed. Please try again.';

            // If backend is unavailable, suggest offline mode
            if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
                setError('Backend server is unavailable. You can use Offline Mode to continue with localStorage.');
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ email: '', password: '', name: '' });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 'var(--spacing-xl)',
        }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>
                        My Assistant
                    </h1>
                    <p className="text-muted">Personal Productivity Hub</p>
                </div>

                <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-lg)',
                        background: 'var(--danger-500)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                Name (Optional)
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                        {!isLogin && (
                            <p className="text-sm text-muted" style={{ marginTop: 'var(--spacing-xs)' }}>
                                Minimum 6 characters
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={toggleMode}
                            disabled={loading}
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                        </button>
                    </div>

                    {onOfflineMode && (
                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                                onClick={onOfflineMode}
                                disabled={loading}
                            >
                                💾 Continue in Offline Mode
                            </button>
                        </div>
                    )}
                </form>

                <div style={{
                    marginTop: 'var(--spacing-xl)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                }}>
                    <p className="text-muted" style={{ marginBottom: 'var(--spacing-xs)' }}>
                        ✨ <strong>New Cloud Sync Feature!</strong>
                    </p>
                    <p className="text-muted">
                        Your data is now stored securely in MongoDB Atlas and syncs across all your devices.
                    </p>
                </div>
            </div>
        </div>
    );
}

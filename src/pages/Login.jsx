import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, LogIn, Github, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            navigate(user.role === 'developer' ? '/developer' : '/student');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('https://spms-backend-s6zu.onrender.com/api/auth/login', {
                username,
                password,
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate(data.role === 'developer' ? '/developer' : '/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: 'radial-gradient(circle at top left, #1e1b4b, #0f172a)' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
                        <LogIn color="white" size={30} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
                </div>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={18} color="#94a3b8" />
                            <input
                                type="text"
                                className="glass-input"
                                style={{ width: '100%', paddingLeft: '45px' }}
                                placeholder="developer123"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={18} color="#94a3b8" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="glass-input"
                                style={{ width: '100%', paddingLeft: '45px', paddingRight: '45px' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '20px' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        New Developer? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/register')}>Register here</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

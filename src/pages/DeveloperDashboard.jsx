import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Layout, Users, FileText, LogOut, PlusCircle, X, User, Lock, Eye, EyeOff, Edit, Upload, File, Calendar, Code, Cpu, Database, IndianRupee } from 'lucide-react';

const DeveloperDashboard = () => {
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ totalStudents: 0, totalProjects: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [uploadingFor, setUploadingFor] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', username: '', password: '' });
    const [editingStudent, setEditingStudent] = useState({ _id: '', name: '', username: '', password: '' });
    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        submissionDate: '',
        frontend: '',
        backend: '',
        database: '',
        amount: '',
        studentId: ''
    });
    const [modalError, setModalError] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchStudents();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get('https://spms-backend-s6zu.onrender.com/api/students/stats/global', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('https://spms-backend-s6zu.onrender.com/api/students', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setModalError('');

        if (newStudent.password.length < 8) {
            setModalError('Password must be at least 8 characters long');
            return;
        }

        try {
            await axios.post('https://spms-backend-s6zu.onrender.com/api/students', newStudent, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchStudents();
            fetchStats();
            setIsModalOpen(false);
            setNewStudent({ name: '', username: '', password: '' });
        } catch (err) {
            setModalError(err.response?.data?.message || 'Error creating student');
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setModalError('');

        if (editingStudent.password && editingStudent.password.length < 8) {
            setModalError('Password must be at least 8 characters long');
            return;
        }

        try {
            await axios.put(`https://spms-backend-s6zu.onrender.com/api/students/${editingStudent._id}`, editingStudent, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setIsEditModalOpen(false);
            setEditingStudent({ _id: '', name: '', username: '', password: '' });
            fetchStudents();
        } catch (err) {
            setModalError(err.response?.data?.message || 'Error updating student');
        }
    };

    const handleFileUpload = async (studentId, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        try {
            await axios.post(`https://spms-backend-s6zu.onrender.com/api/students/${studentId}/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchStudents();
            setUploadingFor(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Error uploading file');
        }
    };

    const handleAssignProject = async (e) => {
        e.preventDefault();
        setModalError('');

        try {
            await axios.post('https://spms-backend-s6zu.onrender.com/api/students/assign-project', projectData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchStudents(); // Refresh list to (potentially) show status change
            fetchStats();
            setIsProjectModalOpen(false);
            setProjectData({
                title: '',
                description: '',
                submissionDate: '',
                frontend: '',
                backend: '',
                database: '',
                amount: '',
                studentId: ''
            });
            fetchStudents(); // Refresh list to (potentially) show status change
        } catch (err) {
            setModalError(err.response?.data?.message || 'Error assigning project');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <nav className="nav-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                        <Layout color="white" size={24} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>DevPortal</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '14px' }}>
                        Welcome, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{user?.name}</span>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '20px', borderRadius: '20px' }}>
                        <Users color="var(--primary)" size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Students</p>
                        <h3 style={{ fontSize: '28px', fontWeight: '700' }}>{stats.totalStudents}</h3>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '20px', borderRadius: '20px' }}>
                        <FileText color="var(--secondary)" size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Projects Assigned</p>
                        <h3 style={{ fontSize: '28px', fontWeight: '700' }}>{stats.totalProjects}</h3>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '20px', borderRadius: '20px' }}>
                        <IndianRupee color="#34d399" size={32} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Revenue</p>
                        <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#34d399' }}>₹{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '600' }}>Manage Students</h2>
                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <UserPlus size={18} /> Add Student
                </button>
            </div>

            <div className="glass-card table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                        <tr>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>Name</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>Username password</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>Date Added</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>Doc</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>PDF</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>ZIP</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>Video</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-secondary)', fontWeight: '500' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td
                                    style={{ padding: '15px 20px', cursor: 'pointer', color: 'var(--primary)', fontWeight: '500' }}
                                    onClick={() => navigate(`/student-details/${student._id}`)}
                                >
                                    {student.name}
                                </td>
                                <td style={{ padding: '15px 20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{student.username}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                                            <Lock size={10} /> ••••••••
                                            <button
                                                onClick={() => {
                                                    setEditingStudent({ _id: student._id, name: student.name, username: student.username, password: '' });
                                                    setIsEditModalOpen(true);
                                                }}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '10px', padding: '0', fontWeight: '700' }}
                                            >
                                                CHANGE
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '15px 20px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        <Calendar size={14} /> {new Date(student.createdAt).toLocaleDateString()}
                                    </div>
                                </td>

                                {/* Document Upload Column */}
                                <td style={{ padding: '15px 20px' }}>
                                    {student.documentPath ? (
                                        <a href={`https://spms-backend-s6zu.onrender.com/${student.documentPath}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}><File size={16} /></a>
                                    ) : (
                                        <label style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.2)' }}>
                                            <Upload size={16} />
                                            <input type="file" hidden onChange={(e) => handleFileUpload(student._id, e.target.files[0])} />
                                        </label>
                                    )}
                                </td>

                                {/* PDF Column */}
                                <td style={{ padding: '15px 20px' }}>
                                    {student.pdfPath ? (
                                        <a href={`https://spms-backend-s6zu.onrender.com/${student.pdfPath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444' }}><File size={16} /></a>
                                    ) : (
                                        <label style={{ cursor: 'pointer', color: 'rgba(239, 68, 68, 0.2)' }}>
                                            <Upload size={16} />
                                            <input type="file" accept=".pdf" hidden onChange={(e) => handleFileUpload(student._id, e.target.files[0])} />
                                        </label>
                                    )}
                                </td>

                                {/* ZIP Column */}
                                <td style={{ padding: '15px 20px' }}>
                                    {student.zipPath ? (
                                        <a href={`https://spms-backend-s6zu.onrender.com/${student.zipPath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24' }}><File size={16} /></a>
                                    ) : (
                                        <label style={{ cursor: 'pointer', color: 'rgba(251, 191, 36, 0.2)' }}>
                                            <Upload size={16} />
                                            <input type="file" accept=".zip" hidden onChange={(e) => handleFileUpload(student._id, e.target.files[0])} />
                                        </label>
                                    )}
                                </td>

                                {/* Video Column */}
                                <td style={{ padding: '15px 20px' }}>
                                    {student.videoPath ? (
                                        <a href={`https://spms-backend-s6zu.onrender.com/${student.videoPath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399' }}><File size={16} /></a>
                                    ) : (
                                        <label style={{ cursor: 'pointer', color: 'rgba(52, 211, 153, 0.2)' }}>
                                            <Upload size={16} />
                                            <input type="file" accept="video/*" hidden onChange={(e) => handleFileUpload(student._id, e.target.files[0])} />
                                        </label>
                                    )}
                                </td>

                                <td style={{ padding: '15px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <button
                                            onClick={() => {
                                                setEditingStudent({ _id: student._id, name: student.name, username: student.username, password: '' });
                                                setIsEditModalOpen(true);
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProjectData({ ...projectData, studentId: student._id });
                                                setIsProjectModalOpen(true);
                                            }}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                                        >
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found. Create one to get started!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative' }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Add New Student</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '14px' }}>Create a student account to assign projects.</p>

                        {modalError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{modalError}</div>}

                        <form onSubmit={handleAddStudent}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#94a3b8" />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '40px' }}
                                        placeholder="Alex Johnson"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <FileText style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#94a3b8" />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '40px' }}
                                        placeholder="alex_dev"
                                        value={newStudent.username}
                                        onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#94a3b8" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                                        placeholder="••••••••"
                                        value={newStudent.password}
                                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                        required
                                    />
                                    <div
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>Min. 8 characters</p>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                Create Student Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {isEditModalOpen && (
                <div className="modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative' }}>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Edit Student</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '14px' }}>Update student details or reset password.</p>

                        {modalError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{modalError}</div>}

                        <form onSubmit={handleUpdateStudent}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#94a3b8" />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '40px' }}
                                        placeholder="Alex Johnson"
                                        value={editingStudent.name}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Username</label>
                                <div style={{ position: 'relative' }}>
                                    <FileText style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#94a3b8" />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '40px' }}
                                        placeholder="alex_dev"
                                        value={editingStudent.username}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>New Password (leave blank to keep current)</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#94a3b8" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                                        placeholder="••••••••"
                                        value={editingStudent.password}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                                    />
                                    <div
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                Update Student Details
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Project Modal */}
            {isProjectModalOpen && (
                <div className="modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            onClick={() => setIsProjectModalOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Assign New Project</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '14px' }}>Define technical stack and budget for the student.</p>

                        {modalError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{modalError}</div>}

                        <form onSubmit={handleAssignProject}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Project Title</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    placeholder="E-commerce Website"
                                    value={projectData.title}
                                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Description</label>
                                <textarea
                                    className="glass-input"
                                    style={{ width: '100%', minHeight: '80px', padding: '12px' }}
                                    placeholder="Project details..."
                                    value={projectData.description}
                                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Frontend</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%' }}
                                        placeholder="React, Tailwind"
                                        value={projectData.frontend}
                                        onChange={(e) => setProjectData({ ...projectData, frontend: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Backend</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%' }}
                                        placeholder="Node.js, Express"
                                        value={projectData.backend}
                                        onChange={(e) => setProjectData({ ...projectData, backend: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Database</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%' }}
                                        placeholder="MongoDB"
                                        value={projectData.database}
                                        onChange={(e) => setProjectData({ ...projectData, database: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Amount (₹)</label>
                                    <div style={{ position: 'relative' }}>
                                        <IndianRupee style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={14} color="#94a3b8" />
                                        <input
                                            type="number"
                                            className="glass-input"
                                            style={{ width: '100%', paddingLeft: '35px' }}
                                            placeholder="5000"
                                            value={projectData.amount}
                                            onChange={(e) => setProjectData({ ...projectData, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Submission Date</label>
                                <input
                                    type="date"
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    value={projectData.submissionDate}
                                    onChange={(e) => setProjectData({ ...projectData, submissionDate: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                Assign Project
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperDashboard;

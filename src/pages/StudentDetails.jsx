import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
    ArrowLeft,
    User,
    Calendar,
    File,
    CheckCircle,
    Clock,
    AlertCircle,
    Edit,
    Code,
    Cpu,
    Database,
    DollarSign,
    IndianRupee,
    Users,
    Plus,
    X,
    Layout,
    FileText,
    Printer,
    Send,
    Trash,
    Download
} from 'lucide-react';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Project Assignment Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        submissionDate: '',
        frontend: '',
        backend: '',
        database: '',
        amount: '',
        studentId: id
    });
    const [modalError, setModalError] = useState('');

    // Inline Edit State
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editProjectData, setEditProjectData] = useState({});

    // Bill Modal State
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [selectedProjectForBill, setSelectedProjectForBill] = useState(null);
    const [billEditData, setBillEditData] = useState({
        invoiceNo: '',
        date: new Date().toLocaleDateString(),
        companyName: 'SPMS',
        companyAddress: 'Technology Park, Hub 7\nSilicon Valley, IN 560001',
        title: '',
        description: '',
        frontend: '',
        backend: '',
        database: '',
        amount: '',
        paymentStatus: 'Pending',
        paymentMethod: 'Digital Transfer',
        signatory: 'SIVAKUMAR S'
    });

    useEffect(() => {
        if (selectedProjectForBill) {
            const inv = selectedProjectForBill.invoiceDetails || {};
            setBillEditData({
                invoiceNo: inv.invoiceNo || `#${selectedProjectForBill._id.slice(-6).toUpperCase()}`,
                date: inv.date || new Date().toLocaleDateString(),
                companyName: inv.companyName || 'SPMS',
                companyAddress: inv.companyAddress || 'Technology Park, Hub 7\nSilicon Valley, IN 560001',
                title: inv.title || selectedProjectForBill.title,
                description: inv.description || selectedProjectForBill.description,
                frontend: inv.frontend || selectedProjectForBill.frontend || '',
                backend: inv.backend || selectedProjectForBill.backend || '',
                database: inv.database || selectedProjectForBill.database || '',
                amount: inv.amount || selectedProjectForBill.amount?.toString() || '0',
                paymentStatus: inv.paymentStatus || 'Pending',
                paymentMethod: inv.paymentMethod || 'Digital Transfer',
                signatory: inv.signatory || 'SIVAKUMAR S'
            });
        }
    }, [selectedProjectForBill]);

    const fetchDetails = async () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                navigate('/');
                return;
            }
            const { token } = JSON.parse(userInfo);

            const { data } = await axios.get(`https://spms-backend-s6zu.onrender.com/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(data);
        } catch (err) {
            console.error('Error fetching details:', err);
            setError(err.response?.data?.message || 'Error fetching student details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDevelopers = async () => {
        try {
            const { data } = await axios.get('https://spms-backend-s6zu.onrender.com/api/auth/developers');
            setDevelopers(data);
        } catch (err) {
            console.error('Error fetching developers:', err);
        }
    };

    useEffect(() => {
        fetchDetails();
        fetchDevelopers();
    }, [id, navigate]);

    const handleAssignProject = async (e) => {
        e.preventDefault();
        setModalError('');
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            await axios.post('https://spms-backend-s6zu.onrender.com/api/students/assign-project', projectData, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setIsProjectModalOpen(false);
            setProjectData({
                title: '',
                description: '',
                submissionDate: '',
                frontend: '',
                backend: '',
                database: '',
                amount: '',
                studentId: id
            });
            fetchDetails(); // Refresh list
        } catch (err) {
            setModalError(err.response?.data?.message || 'Error assigning project');
        }
    };

    const handleUpdateProject = async (projectId) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            await axios.put(`https://spms-backend-s6zu.onrender.com/api/students/project/${projectId}`, editProjectData, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setEditingProjectId(null);
            fetchDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating project');
        }
    };

    const statusPipeline = ['Pending', 'Process', 'Start', 'Backend Work', 'Frontend Work', 'Database Work', 'Completed'];

    const handleStatusToggle = async (project) => {
        if (project.status === 'Completed') return; // Do not toggle if already completed

        const currentIndex = statusPipeline.indexOf(project.status);
        const nextIndex = (currentIndex + 1) % statusPipeline.length;
        const newStatus = statusPipeline[nextIndex];

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            await axios.put(`https://spms-backend-s6zu.onrender.com/api/students/project/${project._id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const handleSaveBill = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const { token } = userInfo;
        try {
            await axios.put(`https://spms-backend-s6zu.onrender.com/api/students/project/${selectedProjectForBill._id}/save-bill`, billEditData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Bill draft saved successfully!');
            fetchDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving bill');
        }
    };

    const handleSendBill = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const { token } = userInfo;
        try {
            await axios.put(`https://spms-backend-s6zu.onrender.com/api/students/project/${selectedProjectForBill._id}/send-bill`, billEditData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Bill sent to student dashboard successfully!');
            setIsBillModalOpen(false);
            fetchDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending bill');
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('printable-bill');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Invoice-${selectedProjectForBill._id.slice(-6).toUpperCase()}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    const handleDeleteDocument = async (field) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        try {
            await axios.put(`https://spms-backend-s6zu.onrender.com/api/students/${id}`, { [field]: '' }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            fetchDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting document');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' };
            case 'Process': return { bg: 'rgba(99, 102, 241, 0.1)', text: '#818cf8' };
            case 'Start': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a78bfa' };
            case 'Backend Work': return { bg: 'rgba(244, 114, 182, 0.1)', text: '#f472b6' };
            case 'Frontend Work': return { bg: 'rgba(56, 189, 248, 0.1)', text: '#38bdf8' };
            case 'Database Work': return { bg: 'rgba(45, 212, 191, 0.1)', text: '#2dd4bf' };
            case 'Completed': return { bg: 'rgba(52, 211, 153, 0.1)', text: '#34d399' };
            default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' };
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading student profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <nav className="nav-bar">
                    <button onClick={() => navigate('/developer')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                </nav>
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginTop: '50px' }}>
                    <AlertCircle size={48} color="#f87171" style={{ marginBottom: '20px' }} />
                    <p style={{ color: '#f87171', fontSize: '18px' }}>{error}</p>
                </div>
            </div>
        );
    }

    const { student, projects } = data;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const totalAmount = projects.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return (
        <div className="dashboard-container">
            <nav className="nav-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/developer')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'white' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Student Profile Card</h1>
                </div>
                <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="btn-primary"
                    style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Assign Project
                </button>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Left Column: Student Info Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'var(--primary)',
                            borderRadius: '32px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                        }}>
                            <User color="white" size={48} />
                        </div>
                        <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>{student.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontWeight: '500' }}>@{student.username}</p>

                        <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <Calendar size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Joined On</p>
                                    <p style={{ fontSize: '15px', fontWeight: '600' }}>{new Date(student.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>
                            </div>

                            <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Document Repositories</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px' }}>
                                <DocTile label="PDF Files" path={student.pdfPath} color="#ef4444" onDelete={() => handleDeleteDocument('pdfPath')} />
                                <DocTile label="ZIP Archives" path={student.zipPath} color="#fbbf24" onDelete={() => handleDeleteDocument('zipPath')} />
                                <DocTile label="Project Demos" path={student.videoPath} color="#34d399" onDelete={() => handleDeleteDocument('videoPath')} />
                                <DocTile label="General Docs" path={student.documentPath} color="var(--primary)" onDelete={() => handleDeleteDocument('documentPath')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Projects */}
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', marginBottom: '15px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Assigned Developer</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <Users size={20} color="#34d399" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <select
                                        className="glass-input"
                                        style={{ width: '100%', fontSize: '14px', padding: '8px', background: 'transparent', border: 'none', color: 'white' }}
                                        value={student.assignedDeveloper?._id || student.assignedDeveloper || ''}
                                        onChange={async (e) => {
                                            const newDevId = e.target.value;
                                            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                            try {
                                                await axios.put(`https://spms-backend-s6zu.onrender.com/api/students/${student._id}`, { assignedDeveloper: newDevId }, {
                                                    headers: { Authorization: `Bearer ${userInfo.token}` }
                                                });
                                                fetchDetails();
                                                alert('Student reassigned successfully!');
                                            } catch (err) {
                                                alert('Error reassigning student');
                                            }
                                        }}
                                    >
                                        <option value="" disabled style={{ background: '#1e293b' }}>Select Developer</option>
                                        {developers.map(dev => (
                                            <option key={dev._id} value={dev._id} style={{ background: '#1e293b', color: 'white' }}>
                                                {dev.name} {dev._id === JSON.parse(localStorage.getItem('userInfo'))?._id ? '(You)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '4px', letterSpacing: '1px' }}>PROJECTS</p>
                                    <h4 style={{ fontSize: '18px', fontWeight: '800' }}>{projects.length}</h4>
                                </div>
                                <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '4px', letterSpacing: '1px' }}>SUCCESS</p>
                                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#34d399' }}>
                                        {projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}%
                                    </h4>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', textAlign: 'center' }}>
                                <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '4px', letterSpacing: '1px' }}>TOTAL REVENUE</p>
                                <h4 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Project Portfolio</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {projects.filter(p => p.status !== 'Completed').length} Pending
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '25px' }}>
                        {projects.length === 0 ? (
                            <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
                                <AlertCircle size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: '20px' }} />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>This student is ready for their first assignment.</p>
                                <button onClick={() => setIsProjectModalOpen(true)} className="btn-primary" style={{ marginTop: '20px', padding: '12px 24px' }}>Assign Project Now</button>
                            </div>
                        ) : (
                            projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(project => {
                                const statusStyle = getStatusStyles(project.status);
                                return (
                                    <div key={project._id} className="glass-card" style={{ padding: '35px', position: 'relative', borderLeft: `4px solid ${statusStyle.text}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                            <div style={{ flex: 1 }}>
                                                {editingProjectId === project._id ? (
                                                    <input
                                                        className="glass-input"
                                                        style={{ width: '90%', fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}
                                                        value={editProjectData.title}
                                                        onChange={(e) => setEditProjectData({ ...editProjectData, title: e.target.value })}
                                                    />
                                                ) : (
                                                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>{project.title}</h3>
                                                )}

                                                {editingProjectId === project._id ? (
                                                    <textarea
                                                        className="glass-input"
                                                        style={{ width: '90%', height: '80px', marginTop: '10px' }}
                                                        value={editProjectData.description}
                                                        onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                                                    />
                                                ) : (
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', maxWidth: '90%' }}>{project.description}</p>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                                <div
                                                    onClick={() => handleStatusToggle(project)}
                                                    style={{
                                                        padding: '10px 20px',
                                                        borderRadius: '12px',
                                                        background: statusStyle.bg,
                                                        color: statusStyle.text,
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        letterSpacing: '1px',
                                                        cursor: 'pointer',
                                                        border: '1px solid transparent',
                                                        transition: 'all 0.3s ease',
                                                        textAlign: 'center',
                                                        minWidth: '140px'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.border = `1px solid ${statusStyle.text}`}
                                                    onMouseLeave={(e) => e.target.style.border = '1px solid transparent'}
                                                    title="Click to advance status"
                                                >
                                                    {project.status.toUpperCase()}
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {editingProjectId === project._id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateProject(project._id)}
                                                                style={{ background: '#34d399', border: 'none', color: 'black', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                            >
                                                                SAVE
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingProjectId(null)}
                                                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                                                            >
                                                                CANCEL
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setEditingProjectId(project._id);
                                                                setEditProjectData(project);
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px' }}
                                                            title="Edit project details"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginBottom: '30px', padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            {editingProjectId === project._id ? (
                                                <>
                                                    <EditField icon={<Code size={16} />} label="Frontend" value={editProjectData.frontend} onChange={(v) => setEditProjectData({ ...editProjectData, frontend: v })} />
                                                    <EditField icon={<Cpu size={16} />} label="Backend" value={editProjectData.backend} onChange={(v) => setEditProjectData({ ...editProjectData, backend: v })} />
                                                    <EditField icon={<Database size={16} />} label="Database" value={editProjectData.database} onChange={(v) => setEditProjectData({ ...editProjectData, database: v })} />
                                                    <EditField icon={<IndianRupee size={16} />} label="Budget" type="number" value={editProjectData.amount} onChange={(v) => setEditProjectData({ ...editProjectData, amount: v })} />
                                                </>
                                            ) : (
                                                <>
                                                    <StackItem icon={<Code size={16} />} label="Frontend Tech" value={project.frontend} />
                                                    <StackItem icon={<Cpu size={16} />} label="Backend Engine" value={project.backend} />
                                                    <StackItem icon={<Database size={16} />} label="Data Core" value={project.database} />
                                                    <StackItem icon={<IndianRupee size={16} />} label="Project Budget" value={project.amount ? `₹${project.amount}` : '₹0'} />
                                                </>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                                <Clock size={16} color="var(--primary)" />
                                                <span style={{ fontWeight: '500' }}>Deadline:</span> {new Date(project.submissionDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </div>
                                            {project.status === 'Completed' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#34d399' }}>
                                                    <CheckCircle size={16} /> <span style={{ fontWeight: '600' }}>Verified Completion</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedProjectForBill(project);
                                                    setIsBillModalOpen(true);
                                                }}
                                                style={{ marginLeft: 'auto', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}
                                                onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.2)'}
                                                onMouseLeave={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                                            >
                                                <FileText size={14} /> GENERATE BILL
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Assign Project Modal (Local Instance) */}
            {isProjectModalOpen && (
                <div className="modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '45px', position: 'relative', maxHeight: '95vh', overflowY: 'auto' }}>
                        <button
                            onClick={() => setIsProjectModalOpen(false)}
                            style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>New Direct Assignment</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '35px', fontSize: '15px' }}>Define technical specs and budget for <b>{student.name}</b>.</p>

                        {modalError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '15px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>{modalError}</div>}

                        <form onSubmit={handleAssignProject} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Project Title</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    style={{ width: '100%' }}
                                    placeholder="Advanced AI Integration"
                                    value={projectData.title}
                                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Full Requirements</label>
                                <textarea
                                    className="glass-input"
                                    style={{ width: '100%', minHeight: '100px', padding: '15px' }}
                                    placeholder="Provide detailed technical requirements..."
                                    value={projectData.description}
                                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Frontend</label>
                                <div style={{ position: 'relative' }}>
                                    <Code style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="var(--primary)" />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '45px' }}
                                        placeholder="React / Next.js"
                                        value={projectData.frontend}
                                        onChange={(e) => setProjectData({ ...projectData, frontend: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Backend</label>
                                <div style={{ position: 'relative' }}>
                                    <Cpu style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="var(--primary)" />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '45px' }}
                                        placeholder="Node / Go"
                                        value={projectData.backend}
                                        onChange={(e) => setProjectData({ ...projectData, backend: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Database</label>
                                <div style={{ position: 'relative' }}>
                                    <Database style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="var(--primary)" />
                                    <input
                                        type="text"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '45px' }}
                                        placeholder="Mongo / Postgres"
                                        value={projectData.database}
                                        onChange={(e) => setProjectData({ ...projectData, database: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Budget Allocation (₹)</label>
                                <div style={{ position: 'relative' }}>
                                    <IndianRupee style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="#34d399" />
                                    <input
                                        type="number"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '45px' }}
                                        placeholder="Budget"
                                        value={projectData.amount}
                                        onChange={(e) => setProjectData({ ...projectData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Final Submission Deadline</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={16} color="var(--primary)" />
                                    <input
                                        type="date"
                                        className="glass-input"
                                        style={{ width: '100%', paddingLeft: '45px' }}
                                        value={projectData.submissionDate}
                                        onChange={(e) => setProjectData({ ...projectData, submissionDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', marginTop: '15px', padding: '16px', fontWeight: '700' }}>
                                Finalize and Assign Project
                            </button>
                        </form>
                    </div>
                </div>
            )
            }
            {/* Bill Generation Modal */}
            {
                isBillModalOpen && selectedProjectForBill && (
                    <div className="no-print modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '800px', borderRadius: '0px', position: 'relative', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                            <div style={{ position: 'sticky', top: 0, background: '#f8fafc', padding: '15px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                                <h3 style={{ color: '#1e293b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} color="var(--primary)" /> BILL PREVIEW</h3>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="btn-primary"
                                        style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Download size={16} /> Download Bill
                                    </button>
                                    <button
                                        onClick={handleSaveBill}
                                        className="btn-primary"
                                        style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: '#f59e0b' }}
                                    >
                                        <CheckCircle size={16} /> SAVE
                                    </button>
                                    <button
                                        onClick={handleSendBill}
                                        className="btn-primary"
                                        style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--secondary)' }}
                                    >
                                        <Send size={16} /> SAVE & SEND
                                    </button>
                                    <button
                                        onClick={() => setIsBillModalOpen(false)}
                                        style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '700' }}
                                    >
                                        CLOSE
                                    </button>
                                </div>
                            </div>

                            <div id="printable-bill" style={{ padding: '60px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                                    <div>
                                        <input
                                            className="bill-input"
                                            style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px', marginBottom: '5px', width: '200px' }}
                                            value={billEditData.companyName}
                                            onChange={(e) => setBillEditData({ ...billEditData, companyName: e.target.value })}
                                        />
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '20px' }}>STUDENT PROJECT MANAGEMENT SYSTEM</div>
                                        <textarea
                                            className="bill-input"
                                            style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.6', width: '250px', height: '80px', display: 'block' }}
                                            value={billEditData.companyAddress}
                                            onChange={(e) => setBillEditData({ ...billEditData, companyAddress: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#e2e8f0', margin: '0 0 10px' }}>INVOICE</h1>
                                        <div style={{ fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                                            <b style={{ whiteSpace: 'nowrap' }}>No:</b>
                                            <input
                                                className="bill-input"
                                                style={{ textAlign: 'right', fontWeight: '700', width: '100px' }}
                                                value={billEditData.invoiceNo}
                                                onChange={(e) => setBillEditData({ ...billEditData, invoiceNo: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                                            <b style={{ whiteSpace: 'nowrap' }}>Date:</b>
                                            <input
                                                className="bill-input"
                                                style={{ textAlign: 'right', fontWeight: '700', width: '100px' }}
                                                value={billEditData.date}
                                                onChange={(e) => setBillEditData({ ...billEditData, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px', padding: '30px', background: '#f8fafc', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>BILLED TO</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>{student.name}</div>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>@{student.username}</div>
                                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '10px' }}>Student ID: {student._id}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>PAYMENT STATUS</div>
                                        <select
                                            className="bill-input"
                                            style={{
                                                display: 'inline-block',
                                                padding: '6px 16px',
                                                borderRadius: '30px',
                                                background: billEditData.paymentStatus === 'Completed' ? '#dcfce7' : '#fef9c3',
                                                color: billEditData.paymentStatus === 'Completed' ? '#166534' : '#854d0e',
                                                fontWeight: '800',
                                                fontSize: '12px',
                                                textTransform: 'uppercase',
                                                width: 'auto',
                                                textAlign: 'center',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                            value={billEditData.paymentStatus}
                                            onChange={(e) => setBillEditData({ ...billEditData, paymentStatus: e.target.value })}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <b>Method:</b>
                                            <input
                                                className="bill-input"
                                                style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', width: '150px' }}
                                                value={billEditData.paymentMethod}
                                                onChange={(e) => setBillEditData({ ...billEditData, paymentMethod: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '60px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #1e293b' }}>
                                            <th style={{ textAlign: 'left', padding: '15px 0', fontSize: '12px', color: '#64748b' }}>DESCRIPTION</th>
                                            <th style={{ textAlign: 'center', padding: '15px 0', fontSize: '12px', color: '#64748b' }}>STACK</th>
                                            <th style={{ textAlign: 'right', padding: '15px 0', fontSize: '12px', color: '#64748b' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '25px 0' }}>
                                                <input
                                                    className="bill-input"
                                                    style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '5px', width: '100%' }}
                                                    value={billEditData.title}
                                                    onChange={(e) => setBillEditData({ ...billEditData, title: e.target.value })}
                                                />
                                                <textarea
                                                    className="bill-input"
                                                    style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px', lineHeight: '1.5', width: '100%', height: '60px' }}
                                                    value={billEditData.description}
                                                    onChange={(e) => setBillEditData({ ...billEditData, description: e.target.value })}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '25px 0' }}>
                                                <input
                                                    className="bill-input"
                                                    style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', textAlign: 'center', width: '100px', display: 'block', margin: '0 auto' }}
                                                    value={billEditData.frontend}
                                                    onChange={(e) => setBillEditData({ ...billEditData, frontend: e.target.value })}
                                                />
                                                <input
                                                    className="bill-input"
                                                    style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', textAlign: 'center', width: '100px', display: 'block', margin: '0 auto' }}
                                                    value={billEditData.backend}
                                                    onChange={(e) => setBillEditData({ ...billEditData, backend: e.target.value })}
                                                />
                                                <input
                                                    className="bill-input"
                                                    style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', textAlign: 'center', width: '100px', display: 'block', margin: '0 auto' }}
                                                    value={billEditData.database}
                                                    onChange={(e) => setBillEditData({ ...billEditData, database: e.target.value })}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '25px 0', fontSize: '18px', fontWeight: '800', color: '#1e293b', verticalAlign: 'top' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    <span>₹</span>
                                                    <input
                                                        className="bill-input"
                                                        style={{ textAlign: 'right', fontWeight: '800', width: '100px', fontSize: '18px' }}
                                                        type="number"
                                                        value={billEditData.amount}
                                                        onChange={(e) => setBillEditData({ ...billEditData, amount: e.target.value })}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ width: '300px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#64748b' }}>
                                            <span>Subtotal</span>
                                            <span>₹{(Number(billEditData.amount) || 0).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#64748b' }}>
                                            <span>Tax (0%)</span>
                                            <span>₹0</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderTop: '2px solid #e2e8f0', marginTop: '10px' }}>
                                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Grand Total</span>
                                            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>₹{(Number(billEditData.amount) || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ height: '1px', width: '200px', background: '#1e293b', marginBottom: '10px' }}></div>
                                        <input
                                            className="bill-input"
                                            style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', width: '200px' }}
                                            value={billEditData.signatory}
                                            onChange={(e) => setBillEditData({ ...billEditData, signatory: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                                        This is a computer-generated document.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>
                {`
                    .bill-input {
                        background: transparent;
                        border: 1px solid transparent;
                        outline: none;
                        font-family: inherit;
                        padding: 2px 5px;
                        border-radius: 4px;
                        transition: all 0.2s ease;
                        resize: none;
                    }
                    .bill-input:hover {
                        background: rgba(99, 102, 241, 0.05);
                        border: 1px dashed rgba(99, 102, 241, 0.2);
                    }
                    .bill-input:focus {
                        background: rgba(99, 102, 241, 0.08);
                        border: 1px solid rgba(99, 102, 241, 0.3);
                    }
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printable-bill, #printable-bill * {
                            visibility: visible;
                        }
                        #printable-bill {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            padding: 40px !important;
                            background: white !important;
                        }
                        .bill-input {
                            border: none !important;
                            background: transparent !important;
                            padding: 0 !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

const DocTile = ({ label, path, color, onDelete }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)',
        padding: '18px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        opacity: path ? 1 : 0.25,
        transform: path ? 'none' : 'scale(0.95)',
        position: 'relative'
    }}>
        {path && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete the ${label}?`)) {
                        onDelete();
                    }
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#f87171',
                    padding: '6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title={`Delete ${label}`}
            >
                <Trash size={14} />
            </button>
        )}
        {path ? (
            <a href={`https://spms-backend-s6zu.onrender.com/${path}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <File size={28} color={color} style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '11px', fontWeight: '800', color: 'white' }}>{label}</p>
            </a>
        ) : (
            <>
                <File size={28} color="rgba(255,255,255,0.2)" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{label}</p>
            </>
        )}
    </div>
);

const StackItem = ({ icon, label, value }) => (
    <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>
            <span style={{ color: 'var(--primary)' }}>{icon}</span> {label}
        </div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: value ? 'white' : 'rgba(255,255,255,0.15)', letterSpacing: '0.3px' }}>{value || 'Not Configured'}</p>
    </div>
);

const EditField = ({ icon, label, value, onChange, type = "text" }) => (
    <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>
            <span style={{ color: 'var(--primary)' }}>{icon}</span> {label}
        </div>
        <input
            type={type}
            className="glass-input"
            style={{ width: '100%', fontSize: '14px', padding: '5px 10px' }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default StudentDetails;

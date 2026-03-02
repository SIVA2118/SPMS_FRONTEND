import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Layout, Calendar, CheckCircle, Clock, LogOut, Code, Cpu, Database, IndianRupee, FileText, Download, Eye, X, User, File, Trash, ArrowLeft } from 'lucide-react';

const StudentDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectForBill, setSelectedProjectForBill] = useState(null);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchProjects();
        fetchProfile();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await axios.get('https://spms-backend-s6zu.onrender.com/api/students/my-projects', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setProjects(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get('https://spms-backend-s6zu.onrender.com/api/auth/me', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
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

    return (
        <div className="dashboard-container">
            <nav className="nav-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'var(--secondary)', padding: '10px', borderRadius: '12px' }}>
                        <Layout color="white" size={24} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>StudentPort</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '14px' }}>
                        Greetings, <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{user?.name}</span>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
                {/* Left Column: Profile & Documents */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Profile Card */}
                    <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', position: 'relative' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'var(--secondary)',
                            borderRadius: '35px',
                            margin: '0 auto 20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)'
                        }}>
                            <User size={48} color="white" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '5px' }}>{profile?.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '25px' }}>@{profile?.username}</p>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <Calendar size={18} color="var(--secondary)" />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Joined On</p>
                                <p style={{ fontSize: '14px', fontWeight: '700' }}>{profile ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '...'}</p>
                            </div>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>DOCUMENT REPOSITORIES</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
                                <DocTile label="PDF Files" path={profile?.pdfPath} color="#f87171" />
                                <DocTile label="ZIP Archives" path={profile?.zipPath} color="#60a5fa" />
                                <DocTile label="Project Demos" path={profile?.videoPath} color="#fbbf24" />
                                <DocTile label="General Docs" path={profile?.documentPath} color="#34d399" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Projects */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Project Portfolio</h2>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {projects.length} {projects.length === 1 ? 'Project' : 'Projects'} assigned
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
                        {projects.map((project) => (
                            <div key={project._id} className="glass-card" style={{ padding: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{project.title}</h3>
                                    <span style={{
                                        background: project.status === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                        color: project.status === 'Completed' ? '#4ade80' : '#facc15',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '700'
                                    }}>
                                        {project.status.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                                    {project.description}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                    <StackItem icon={<Code size={14} />} label="Frontend" value={project.frontend} />
                                    <StackItem icon={<Cpu size={14} />} label="Backend" value={project.backend} />
                                    <StackItem icon={<Database size={14} />} label="Database" value={project.database} />
                                    <StackItem icon={<IndianRupee size={14} />} label="Amount" value={`₹${project.amount}`} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => { setSelectedProject(project); setIsDetailsModalOpen(true); }}
                                            className="glass-card"
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '10px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                background: 'rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <Eye size={14} /> VIEW DETAILS
                                        </button>
                                        {project.invoiceDetails?.isSent && (
                                            <button
                                                onClick={() => { setSelectedProjectForBill(project); setIsBillModalOpen(true); }}
                                                className="glass-card"
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '10px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                    color: '#818cf8',
                                                    cursor: 'pointer',
                                                    background: 'rgba(99, 102, 241, 0.1)'
                                                }}
                                            >
                                                <FileText size={14} /> VIEW BILL
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            <Calendar size={14} /> {new Date(project.submissionDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && !loading && (
                            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
                                    <CheckCircle color="var(--text-secondary)" size={40} />
                                </div>
                                <h3 style={{ marginBottom: '10px' }}>No Assigned Projects</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Your projects will appear here once your developer allocates them.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bill Viewing Modal */}
            {isBillModalOpen && selectedProjectForBill && (
                <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '800px', borderRadius: '0px', position: 'relative', maxHeight: '100vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ position: 'sticky', top: 0, background: '#f8fafc', padding: '15px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                            <h3 style={{ color: '#1e293b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} color="var(--secondary)" /> OFFICIAL INVOICE</h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="btn-primary"
                                    style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--secondary)' }}
                                >
                                    <Download size={16} /> Download Bill
                                </button>
                                <button
                                    onClick={() => setIsBillModalOpen(false)}
                                    style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: '700' }}
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>

                        <div id="printable-bill" style={{ padding: '60px', color: '#1e293b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--secondary)', letterSpacing: '-1px', marginBottom: '5px' }}>{selectedProjectForBill.invoiceDetails?.companyName}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '20px' }}>STUDENT PROJECT MANAGEMENT SYSTEM</div>
                                    <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{selectedProjectForBill.invoiceDetails?.companyAddress}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#e2e8f0', margin: '0 0 10px' }}>INVOICE</h1>
                                    <div style={{ fontSize: '14px', color: '#1e293b' }}><b>No:</b> {selectedProjectForBill.invoiceDetails?.invoiceNo}</div>
                                    <div style={{ fontSize: '14px', color: '#1e293b' }}><b>Date:</b> {selectedProjectForBill.invoiceDetails?.date}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px', padding: '30px', background: '#f8fafc', borderRadius: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>BILLED TO</div>
                                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>{user.name}</div>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>@{user.username}</div>
                                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '10px' }}>Student ID: {user._id || user.id}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>PAYMENT STATUS</div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '6px 16px',
                                        borderRadius: '30px',
                                        background: selectedProjectForBill.invoiceDetails?.paymentStatus === 'Completed' ? '#dcfce7' : '#fef9c3',
                                        color: selectedProjectForBill.invoiceDetails?.paymentStatus === 'Completed' ? '#166534' : '#854d0e',
                                        fontWeight: '800',
                                        fontSize: '12px'
                                    }}>
                                        {(selectedProjectForBill.invoiceDetails?.paymentStatus || selectedProjectForBill.status).toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '15px' }}>
                                        <b>Method:</b> {selectedProjectForBill.invoiceDetails?.paymentMethod || 'Digital Transfer'}
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
                                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>{selectedProjectForBill.invoiceDetails?.title}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px', lineHeight: '1.5' }}>{selectedProjectForBill.invoiceDetails?.description}</div>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '25px 0' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{selectedProjectForBill.invoiceDetails?.frontend}</div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{selectedProjectForBill.invoiceDetails?.backend}</div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{selectedProjectForBill.invoiceDetails?.database}</div>
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '25px 0', fontSize: '18px', fontWeight: '800', color: '#1e293b', verticalAlign: 'top' }}>
                                            ₹{(Number(selectedProjectForBill.invoiceDetails?.amount) || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ width: '300px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#64748b' }}>
                                        <span>Subtotal</span>
                                        <span>₹{(Number(selectedProjectForBill.invoiceDetails?.amount) || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: '#64748b' }}>
                                        <span>Tax (0%)</span>
                                        <span>₹0</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderTop: '2px solid #e2e8f0', marginTop: '10px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Grand Total</span>
                                        <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--secondary)' }}>₹{(Number(selectedProjectForBill.invoiceDetails?.amount) || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ height: '1px', width: '200px', background: '#1e293b', marginBottom: '10px' }}></div>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{selectedProjectForBill.invoiceDetails?.signatory}</div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                                    This is a computer-generated document.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Details Modal */}
            {isDetailsModalOpen && selectedProject && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '750px', padding: '40px', position: 'relative', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => setIsDetailsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}>
                            <X size={24} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px' }}>
                            <div style={{ background: 'var(--secondary)', padding: '15px', borderRadius: '20px' }}>
                                <Layout size={32} color="white" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{selectedProject.title}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Project Implementation Details</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <DetailItem icon={<Code size={20} color="#818cf8" />} label="Frontend Technology" value={selectedProject.frontend} />
                                <DetailItem icon={<Cpu size={20} color="#f472b6" />} label="Backend Engine" value={selectedProject.backend} />
                                <DetailItem icon={<Database size={20} color="#2dd4bf" />} label="Data Core" value={selectedProject.database} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <DetailItem icon={<IndianRupee size={20} color="#fbbf24" />} label="Project Budget" value={`₹${selectedProject.amount}`} />
                                <DetailItem icon={<Calendar size={20} color="#60a5fa" />} label="Submission Deadline" value={new Date(selectedProject.submissionDate).toLocaleDateString()} />
                                <DetailItem icon={<Clock size={20} color="#94a3b8" />} label="Submission Time" value="11:59 PM" />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px', marginBottom: '35px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px' }}>Project Overview</h4>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '15px' }}>{selectedProject.description}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', flexWrap: 'wrap' }}>
                            <button onClick={() => setIsDetailsModalOpen(false)} style={{ padding: '12px 25px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', cursor: 'pointer' }}>
                                CLOSE VIEW
                            </button>
                            {selectedProject.invoiceDetails?.isSent && (
                                <button
                                    onClick={() => { setIsDetailsModalOpen(false); setSelectedProjectForBill(selectedProject); setIsBillModalOpen(true); }}
                                    className="btn-primary"
                                    style={{ background: 'var(--secondary)', padding: '12px 30px', fontWeight: '700' }}
                                >
                                    VIEW OFFICIAL BILL
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: value ? 'white' : 'rgba(255,255,255,0.2)' }}>{value || 'Not Specified'}</p>
        </div>
    </div>
);

const DocTile = ({ label, path, color }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)',
        padding: '18px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        opacity: path ? 1 : 0.25,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: path ? 'pointer' : 'default',
        transform: path ? 'none' : 'scale(0.95)'
    }}>
        {path ? (
            <a href={path.startsWith('http') ? path : `https://spms-backend-s6zu.onrender.com/${path}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <File size={24} color={color} style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '10px', fontWeight: '800', color: 'white' }}>{label}</p>
            </a>
        ) : (
            <>
                <File size={24} color="rgba(255,255,255,0.2)" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{label}</p>
            </>
        )}
    </div>
);

const StackItem = ({ icon, label, value }) => (
    <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '10px', marginBottom: '4px' }}>
            {icon} {label}
        </div>
        <p style={{ fontSize: '12px', fontWeight: '600', color: value ? 'white' : 'rgba(255,255,255,0.3)' }}>{value || 'N/A'}</p>
    </div>
);

export default StudentDashboard;

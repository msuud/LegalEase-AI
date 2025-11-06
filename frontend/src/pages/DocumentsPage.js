import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaFileAlt, FaCommentDots } from 'react-icons/fa';
import moment from 'moment';
import ChatModal from '../components/ChatModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DocumentsPage = () => {
    const { currentUser } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);

    useEffect(() => {
        if (currentUser?.uid) {
            fetchDocuments();
        }
    }, [currentUser]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/documents/${currentUser.uid}`);
            setDocuments(response.data);
        } catch (err) {
            console.error("Error fetching documents:", err);
            setError("Failed to load documents. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const openChat = (docSessionId, docTitle) => {
        setSessionData({ sessionId: docSessionId, title: docTitle });
        setShowChatModal(true);
    };

    return (
        <div className="d-flex" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0 fw-bold">Documents</h2>
                </div>

                <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                    <Card.Body className="p-4">
                        {currentUser && (
                            <p className="text-muted mb-4">
                                <strong>{currentUser.email.split('@')[0]}</strong>, here are all the legal documents you've processed.
                            </p>
                        )}
                        
                        {error && <Alert variant="danger">{error}</Alert>}

                        {isLoading ? (
                            <div className="text-center p-5">
                                <Spinner animation="border" style={{ color: '#FF8C00' }} />
                                <p className="mt-2" style={{ color: '#FF8C00' }}>Loading documents...</p>
                            </div>
                        ) : (
                            <div className="mt-3">
                                {documents.map(doc => (
                                    <div 
                                        key={doc.session_id} 
                                        className="d-flex justify-content-between align-items-center border-bottom py-3"
                                        style={{ transition: 'background-color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div 
                                            className="d-flex align-items-center flex-grow-1"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => openChat(doc.session_id, doc.title)}
                                        >
                                            <div className="p-2 rounded-circle me-3" style={{ backgroundColor: '#FFE5CC' }}>
                                                <FaFileAlt size={20} style={{ color: '#FF8C00' }} />
                                            </div>
                                            <div className="me-auto">
                                                <strong className="d-block">{doc.title}</strong>
                                                <small className="text-muted">
                                                    {moment(doc.time, 'M/D/YYYY, hh:mm:ss A').format('M/D/YYYY, h:mm A')}
                                                </small>
                                            </div>
                                        </div>
                                        
                                        {doc.has_chat && (
                                            <Button 
                                                size="sm"
                                                className="ms-3 d-flex align-items-center"
                                                onClick={() => openChat(doc.session_id, doc.title)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #4A90E2',
                                                    color: '#4A90E2',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <FaCommentDots className="me-1" /> Chat
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {documents.length === 0 && (
                                    <div className="text-center text-muted p-5">
                                        You haven't processed any documents yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </Card.Body>
                </Card>
                
                {/* Chat Modal */}
                {sessionData && (
                    <ChatModal 
                        show={showChatModal} 
                        onHide={() => setShowChatModal(false)} 
                        sessionData={sessionData}
                    />
                )}
            </div>
        </div>
    );
};

export default DocumentsPage;
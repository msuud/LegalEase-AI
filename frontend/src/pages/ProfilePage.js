import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Card, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaCalendarAlt, FaClock } from 'react-icons/fa';
import moment from 'moment';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [creationDate, setCreationDate] = useState(null);
    const [lastSignInTime, setLastSignInTime] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const creation = currentUser.metadata.creationTime;
            if (creation) {
                setCreationDate(moment(creation).format('MMMM D, YYYY'));
            }

            const lastSignIn = currentUser.metadata.lastSignInTime;
            if (lastSignIn) {
                setLastSignInTime(moment(lastSignIn).format('MMMM D, YYYY'));
            }
            setIsLoading(false);
        }
    }, [currentUser]);

    return (
        <div className="d-flex" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0 fw-bold">Profile</h2>
                </div>

                <Card className="border-0 shadow-sm" style={{ maxWidth: '900px', borderRadius: '12px' }}>
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-4">
                            <div className="p-3 rounded-circle me-3" style={{ backgroundColor: '#FFE5CC', display: 'inline-block' }}>
                                <FaUser size={24} style={{ color: '#FF8C00' }} />
                            </div>
                            <div>
                                <h3 className="mb-1" style={{ color: '#FF8C00', fontWeight: '600' }}>Profile</h3>
                                <p className="text-muted mb-0">Manage your account information</p>
                            </div>
                        </div>

                        <h5 className="mb-3 fw-semibold">Your Account Details</h5>

                        {isLoading ? (
                            <div className="text-center p-5">
                                <Spinner animation="border" style={{ color: '#FF8C00' }} />
                                <p className="mt-2" style={{ color: '#FF8C00' }}>Loading profile data...</p>
                            </div>
                        ) : (
                            <div>
                                <div className="p-4 mb-3 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <div className="p-2 rounded me-3" style={{ backgroundColor: 'white' }}>
                                        <FaEnvelope size={20} style={{ color: '#4A90E2' }} />
                                    </div>
                                    <div>
                                        <p className="mb-0 text-muted small">Email Address</p>
                                        <p className="mb-0 fw-semibold">{currentUser?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                
                                <div className="p-4 mb-3 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <div className="p-2 rounded me-3" style={{ backgroundColor: 'white' }}>
                                        <FaCalendarAlt size={20} style={{ color: '#4A90E2' }} />
                                    </div>
                                    <div>
                                        <p className="mb-0 text-muted small">Account Created</p>
                                        <p className="mb-0 fw-semibold">{creationDate || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="p-4 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <div className="p-2 rounded me-3" style={{ backgroundColor: 'white' }}>
                                        <FaClock size={20} style={{ color: '#4A90E2' }} />
                                    </div>
                                    <div>
                                        <p className="mb-0 text-muted small">Last Sign-in</p>
                                        <p className="mb-0 fw-semibold">{lastSignInTime || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FaFileAlt, FaCommentDots, FaUpload } from "react-icons/fa";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import moment from "moment";
import ChatModal from "../components/ChatModal";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchDocuments();
    }
  }, [currentUser]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/documents/${currentUser.uid}`
      );
      setRecentDocuments(response.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
    setUploadError(null);
    setSessionData(null);
  };

  const handleSummarize = async (fileToUpload = file) => {
    if (!fileToUpload || !currentUser?.uid) {
      setUploadError("Please select a file and ensure you are logged in.");
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("user_id", currentUser.uid);
      formData.append("time", moment().format("M/D/YYYY, hh:mm:ss A"));

      const response = await axios.post(`${API_URL}/summarize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newSummary = response.data.summary;
      setSummary(newSummary);
      setSessionData({
        sessionId: response.data.session_id,
        title: fileToUpload.name,
      });

      fetchDocuments();
    } catch (error) {
      console.error(
        "Summarization error:",
        error.response?.data?.error || error.message
      );
      setUploadError(
        error.response?.data?.error ||
          "Failed to generate summary. Please try again."
      );
      setSummary("");
      setSessionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const documentCount = recentDocuments.length > 0 ? recentDocuments.length : 0;
  const documentTitle =
    sessionData?.title || recentDocuments[0]?.title || "AWAITING UPLOAD";
  const summarySectionHeading =
    file && !summary
      ? file.name // show document name before summary
      : summary
      ? "Generated Summary" // once summary exists
      : "Upload a Document";
  const currentSessionId =
    sessionData?.sessionId || recentDocuments[0]?.session_id;

  const openChat = (docSessionId, docTitle) => {
    setSessionData({ sessionId: docSessionId, title: docTitle });
    setShowChatModal(true);
  };

  const handleUploadAnotherFile = () => {
    setFile(null);
    setSummary("");
    setSessionData(null);
    setShowChatModal(false);
    document.getElementById("file-upload").value = "";
  };

  return (
    <div
      className="d-flex"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <Sidebar />
      <div className="flex-grow-1 p-4">
        {/* Header with Logout */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">Overview</h2>
        </div>

        {/* Stats Card */}
        <div className="row mb-4">
          <div className="col-lg-4 col-md-6 mb-3">
            <Card
              className="border-0 shadow-sm h-100"
              style={{ borderRadius: "12px" }}
            >
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Documents Processed</p>
                  <h3 className="fw-bold mb-0" style={{ color: "#FF8C00" }}>
                    {documentCount}
                  </h3>
                  <small className="text-success">+25%</small>
                </div>
                <div
                  className="p-3 rounded-circle"
                  style={{ backgroundColor: "#FFE5CC" }}
                >
                  <FaFileAlt size={24} style={{ color: "#FF8C00" }} />
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        <div className="row">
          {/* Generated Summary Section */}
          <div className="col-lg-8 mb-4">
            <Card
              className="border-0 shadow-sm h-100"
              style={{ borderRadius: "12px" }}
            >
              <Card.Body className="p-4">
                <h4 className="mb-4 fw-semibold" style={{ color: "#FF8C00" }}>
                  {summarySectionHeading}
                </h4>

                {/* File Upload Area */}
                {!file && !summary && (
                  <div
                    className="text-center p-5 mb-4"
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    }
                    style={{
                      cursor: "pointer",
                      border: "2px dashed #ddd",
                      borderRadius: "12px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <FaUpload
                      size={48}
                      className="mb-3"
                      style={{ color: "#FF8C00" }}
                    />
                    <p className="text-muted mb-0">
                      Click to upload or drag & drop a PDF/DOCX file
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      accept=".pdf,.docx"
                      hidden
                    />
                  </div>
                )}

                {file && !summary && !isLoading && (
                  <div
                    className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <p className="mb-0">
                      Selected File: <strong>{file.name}</strong>
                    </p>
                    <Button
                      onClick={() => handleSummarize()}
                      disabled={isLoading}
                      style={{
                        backgroundColor: "#FF8C00",
                        border: "none",
                        borderRadius: "6px",
                      }}
                    >
                      Generate Summary
                    </Button>
                  </div>
                )}

                {uploadError && <Alert variant="danger">{uploadError}</Alert>}

                {/* Summary Display Area - Only show when there's a summary or loading */}
                {(isLoading || summary) && (
                  <div className="summary-display">
                    {isLoading ? (
                      <div className="text-center p-5">
                        <Spinner
                          animation="border"
                          style={{ color: "#FF8C00" }}
                        />
                        <p className="mt-2" style={{ color: "#FF8C00" }}>
                          Generating summary...
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-dark" style={{ lineHeight: "1.8" }}>
                          {summary}
                        </p>

                        <div className="d-flex justify-content-between mt-4">
                          <Button
                            onClick={handleUploadAnotherFile}
                            style={{
                              backgroundColor: "#FF8C00",
                              border: "none",
                              borderRadius: "6px",
                            }}
                          >
                            Upload Another File
                          </Button>
                          {currentSessionId && (
                            <Button
                              onClick={() =>
                                openChat(currentSessionId, documentTitle)
                              }
                              className="d-flex align-items-center"
                              style={{
                                backgroundColor: "#4A90E2",
                                border: "none",
                                borderRadius: "6px",
                              }}
                            >
                              <FaCommentDots className="me-2" /> Chat about this
                              document
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Recent Documents Section */}
          <div className="col-lg-4 mb-4">
            <Card
              className="border-0 shadow-sm h-100"
              style={{ borderRadius: "12px" }}
            >
              <Card.Body className="p-4">
                <h5 className="mb-3 fw-semibold">Recent Documents</h5>
                <ul className="list-unstyled">
                  {recentDocuments.map((doc) => (
                    <li
                      key={doc.session_id}
                      className="d-flex align-items-center border-bottom py-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => openChat(doc.session_id, doc.title)}
                    >
                      <div
                        className="p-2 rounded-circle me-3"
                        style={{ backgroundColor: "#FFE5CC" }}
                      >
                        <FaFileAlt style={{ color: "#FF8C00" }} />
                      </div>
                      <div className="flex-grow-1">
                        <p
                          className="mb-0 fw-semibold text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {doc.title}
                        </p>
                        <small className="text-muted">
                          {moment(doc.time, "M/D/YYYY, hh:mm:ss A").format(
                            "M/D/YYYY, h:mm A"
                          )}
                        </small>
                      </div>
                      {doc.has_chat && (
                        <FaCommentDots
                          className="text-primary"
                          title="Chat available"
                        />
                      )}
                    </li>
                  ))}
                  {recentDocuments.length === 0 && (
                    <li className="text-center text-muted py-5">
                      No recent documents found.
                    </li>
                  )}
                </ul>
              </Card.Body>
            </Card>
          </div>
        </div>

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

export default DashboardPage;

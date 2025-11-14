import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import { FaPaperPlane, FaTimes, FaFileAlt } from "react-icons/fa";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ChatModal = ({ show, onHide, sessionData }) => {
  const { sessionId, title } = sessionData;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (show && sessionId) {
      fetchChatHistory();
    }
  }, [show, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/history/${sessionId}`);
      setMessages(response.data.history || []);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        session_id: sessionId,
        message: input.trim(),
      });

      const aiResponse = { role: "assistant", content: response.data.response };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header className="position-relative">
        <Modal.Title
          className="fs-5 d-flex align-items-center fw-bold"
          style={{ color: "#FF8C00", textTransform: "uppercase" }}
        >
          <FaFileAlt className="me-2 text-warning" />
          {title}
        </Modal.Title>

        <Button
          variant="light"
          onClick={onHide}
          className="rounded-circle p-2 position-absolute"
          style={{ top: "10px", right: "10px" }}
        >
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body
        className="p-0"
        style={{ height: "60vh", display: "flex", flexDirection: "column" }}
      >
        <div
          className="chat-area p-3 overflow-auto flex-grow-1"
          style={{ backgroundColor: "#f9f9f9" }}
        >
          {messages.length === 0 && !isLoading ? (
            <div className="text-center text-muted mt-5">
              Start the conversation by asking a question about the document.
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex ${
                  msg.role === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                } mb-2`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-light border"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="d-flex justify-content-start mb-2">
              <div className="p-2 rounded-3 bg-light border">
                <Spinner
                  animation="grow"
                  size="sm"
                  variant="secondary"
                  className="me-1"
                />
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <Form onSubmit={handleSend} className="p-3 border-top">
          <div className="input-group">
            <Form.Control
              type="text"
              placeholder="Ask a question about the document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="warning"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FaPaperPlane />
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChatModal;

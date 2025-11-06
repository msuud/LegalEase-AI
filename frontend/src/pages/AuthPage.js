import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Card, Row, Col, Alert, Spinner } from "react-bootstrap";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import { FaScaleBalanced } from "react-icons/fa6";
import { FaGoogle, FaCheck } from "react-icons/fa";

const AuthPage = ({ isSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pageTitle = isSignIn ? "Sign in" : "Sign Up";
  const actionText = isSignIn ? "Sign In" : "Sign Up";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignIn) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let errorMessage = err.message.replace("Firebase: ", "");

      if (isSignIn && err.code === "auth/user-not-found") {
        errorMessage =
          "No account found with this email. Please sign up first.";
      } else if (isSignIn && err.code === "auth/wrong-password") {
        errorMessage = "Invalid password. Please try again.";
      } else if (!isSignIn && err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row className="vh-100 m-0">
      {/* Left Panel - Orange Background */}
      <Col
        md={7}
        className="d-none d-md-flex flex-column justify-content-center text-white p-5"
        style={{
          background: "linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%)",
        }}
      >
        <div className="px-5">
          {/* Logo */}
          <div className="d-flex align-items-center mb-4">
            <FaScaleBalanced size={40} color="white" className="me-2" />
            <span className="fs-4 fw-bold">LegalEase</span>
          </div>

          <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: "1.2" }}>
            Any Legal Document
            <br />
            to Simple Language,
            <br />
            Instantly.
          </h1>

          <p
            className="lead mb-5"
            style={{ fontSize: "1.1rem", opacity: 0.95 }}
          >
            From complex legal jargon to clear explanations in seconds. No more
            confusion with legal documents.
          </p>

          <ul className="list-unstyled fs-5">
            <li className="mb-3 d-flex align-items-center">
              <span
                className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-white"
                style={{ width: "30px", height: "30px" }}
              >
                <FaCheck style={{ color: "#FF8C00", fontSize: "14px" }} />
              </span>
              High-accuracy legal text translation
            </li>
            <li className="mb-3 d-flex align-items-center">
              <span
                className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-white"
                style={{ width: "30px", height: "30px" }}
              >
                <FaCheck style={{ color: "#FF8C00", fontSize: "14px" }} />
              </span>
              Smart document analysis
            </li>
            <li className="mb-3 d-flex align-items-center">
              <span
                className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-white"
                style={{ width: "30px", height: "30px" }}
              >
                <FaCheck style={{ color: "#FF8C00", fontSize: "14px" }} />
              </span>
              Multi-language support
            </li>
          </ul>
        </div>
      </Col>

      {/* Right Panel - Sign In Form */}
      <Col
        md={5}
        className="d-flex align-items-center justify-content-center bg-white p-5"
      >
        <Card className="border-0 w-100" style={{ maxWidth: "450px" }}>
          <Card.Body className="px-4">
            <h2
              className="text-center fw-bold mb-3"
              style={{ fontSize: "2rem" }}
            >
              {pageTitle}
            </h2>
            <p className="text-center text-muted mb-4">
              Welcome back! {pageTitle} to your account
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              className="w-100 mb-4 py-3 d-flex align-items-center justify-content-center fw-semibold"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                backgroundColor: "#DB4437",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            >
              <FaGoogle className="me-2" size={18} /> Continue with Google
            </Button>

            <div className="text-center text-muted my-4 position-relative">
              <span
                className="bg-white px-3"
                style={{ position: "relative", zIndex: 1 }}
              >
                OR
              </span>
              <hr
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  zIndex: 0,
                }}
              />
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 py-3 fw-semibold"
                disabled={isLoading}
                style={{
                  backgroundColor: "#FF8C00",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  actionText
                )}
              </Button>
            </Form>

            <div className="text-center mt-4">
              {isSignIn ? (
                <>
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    style={{
                      color: "#FF8C00",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    style={{
                      color: "#FF8C00",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="text-muted text-decoration-none">
                ← Back to Home
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AuthPage;

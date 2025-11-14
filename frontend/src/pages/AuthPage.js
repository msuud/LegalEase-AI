import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Row, Col, Alert, Spinner } from "react-bootstrap";
import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FaScaleBalanced } from "react-icons/fa6";
import { FaGoogle, FaCheck } from "react-icons/fa";

const AuthPage = ({ isSignIn }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pageTitle = isSignIn ? "Sign in" : "Sign Up";

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile exists
      const userProfileRef = doc(db, "users", user.uid);
      const userProfileSnap = await getDoc(userProfileRef);

      if (userProfileSnap.exists()) {
        window.location.href = "/"; // Home
      } else {
        window.location.href = "/profile"; // Create profile
      }
    } catch (err) {
      console.error("Google Sign-in Error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row className="vh-100 m-0">
      <Col
        md={7}
        className="d-none d-md-flex flex-column justify-content-center text-white p-5"
        style={{
          background: "linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%)",
        }}
      >
        <div className="px-5">
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
            From complex legal jargon to clear explanations in seconds.
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
              Welcome! {pageTitle} to your account
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* GOOGLE BUTTON ONLY */}
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
              <FaGoogle className="me-2" size={18} />{" "}
              {isLoading ? "Processing..." : "Continue with Google"}
            </Button>

            {/* SIGN IN / SIGN UP SWITCH */}
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

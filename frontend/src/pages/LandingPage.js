import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaLanguage,
  FaRobot,
  FaClock,
  FaLock,
  FaFileAlt,
} from "react-icons/fa";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div
      className="landing-page-container min-vh-100"
      style={{
        background:
          "linear-gradient(to bottom right, #e8f4f8 0%, #f0e5dc 40%, #e8d5c8 70%, #d8c5b5 100%)",
      }}
    >
      <Navbar />

      <div className="container text-center pt-5 pb-5">
        <h1
          className="display-3 fw-bold mb-4"
          style={{ color: "#1a1a1a", lineHeight: "1.2" }}
        >
          Transform Complex Legal Documents
          <br />
          into Simple Language
        </h1>
        <p
          className="lead mb-5 px-md-5"
          style={{
            color: "#333",
            fontSize: "1.1rem",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          Our AI-powered platform helps Indian citizens understand legal
          documents by converting complex legal language into plain,
          easy-to-understand explanations in Hindi and regional languages.
        </p>

        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-5 gap-4">
          <Link
            to="/signup"
            className="btn btn-lg fw-bold px-5 py-3"
            style={{
              backgroundColor: "#FF8C00",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
            }}
          >
            Get Started →
          </Link>

          <div
            className="d-flex align-items-center bg-white p-4 rounded-3 shadow-sm"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <div className="d-flex align-items-center me-3">
              <div
                className="p-3 rounded-circle"
                style={{ backgroundColor: "#ffe5e5" }}
              >
                <FaFileAlt className="text-danger" size={24} />
              </div>
              <span className="ms-2 fw-semibold">Complex</span>
            </div>
            <span className="mx-3 fs-4" style={{ color: "#FF8C00" }}>
              →
            </span>
            <div className="d-flex align-items-center">
              <div
                className="p-3 rounded-circle"
                style={{ backgroundColor: "#e5f5e5" }}
              >
                <FaFileAlt className="text-success" size={24} />
              </div>
              <span className="ms-2 fw-semibold">Simple</span>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mt-5 g-4">
          {[
            { icon: FaLanguage, label: "Multi-language", color: "#FF8C00" },
            { icon: FaRobot, label: "AI-Powered", color: "#FF8C00" },
            { icon: FaClock, label: "Real-time", color: "#FF8C00" },
            { icon: FaLock, label: "Secure", color: "#FF8C00" },
          ].map((feature, index) => (
            <div className="col-6 col-md-3 mb-4" key={index}>
              <div className="d-flex flex-column align-items-center">
                <div
                  className="p-4 rounded-circle bg-white shadow-sm mb-3"
                  style={{
                    width: "90px",
                    height: "90px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <feature.icon size={32} style={{ color: feature.color }} />
                </div>
                <p className="fw-semibold mb-0" style={{ color: "#333" }}>
                  {feature.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

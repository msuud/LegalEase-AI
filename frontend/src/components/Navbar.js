import React from "react";
import { Link } from "react-router-dom";
import { FaScaleBalanced } from "react-icons/fa6";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand navbar-light bg-transparent pt-4 pb-4">
      <div
        className="container-fluid"
        style={{ maxWidth: "1400px", margin: "0 auto" }}
      >
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <FaScaleBalanced size={24} color="#e74c3c" className="me-2" />
          <span className="fw-bold fs-5" style={{ color: "#1a1a1a" }}>
            LegalEase
          </span>
        </Link>
        <div className="d-flex">
          <Link
            to="/signin"
            className="btn me-3 px-4"
            style={{
              border: "1px solid #ddd",
              backgroundColor: "white",
              color: "#333",
              borderRadius: "6px",
            }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="btn px-4"
            style={{
              backgroundColor: "#FF8C00",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

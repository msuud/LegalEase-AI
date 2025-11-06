import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { FaHome, FaFileAlt, FaUser, FaSignOutAlt } from "react-icons/fa";
import { auth } from "../firebase";
import { FaScaleBalanced } from "react-icons/fa6";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const navItems = [
    { path: "/dashboard", icon: FaHome, name: "Overview" },
    { path: "/documents", icon: FaFileAlt, name: "Documents" },
    { path: "/profile", icon: FaUser, name: "Profile" },
  ];

  return (
    <div
      className="d-flex flex-column bg-white border-end"
      style={{ width: "250px", height: "100vh", position: "sticky", top: 0 }}
    >
      {/* Logo Section */}
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center">
          <FaScaleBalanced
            className="me-2" 
            size={24} 
            style={{ color: "#FF8C00" }}
          />
          <span className="fs-5 fw-bold text-dark">LegalEase</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow-1 p-3">
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li className="nav-item mb-2" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 py-2 rounded ${
                    isActive
                      ? "bg-warning-subtle text-dark fw-semibold"
                      : "text-dark"
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#FFF3E0" : "transparent",
                  transition: "all 0.2s",
                })}
              >
                <item.icon
                  className="me-3"
                  size={18}
                  style={{ color: "#FF8C00" }}
                />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button at Bottom */}
      <div className="p-3 border-top">
        <button
          className="btn w-100 d-flex align-items-center justify-content-center px-3 py-2"
          onClick={handleLogout}
          style={{
            border: "1px solid #FF8C00",
            color: "#FF8C00",
            backgroundColor: "white",
            borderRadius: "6px",
          }}
        >
          <FaSignOutAlt className="me-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

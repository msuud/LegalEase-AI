import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useAuth, AuthProvider } from "./context/AuthContext"; // ✅ Import from AuthContext

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import ProfilePage from "./pages/ProfilePage";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <ClipLoader color="#FF8C00" loading={loading} size={50} />
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/signin" replace />;
};

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <ClipLoader color="#FF8C00" loading={loading} size={50} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/signin"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage isSignIn={true} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage isSignIn={false} />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function RootApp() {
  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* ✅ Wrap entire app */}
        <App />
      </AuthProvider>
    </Router>
  );
}

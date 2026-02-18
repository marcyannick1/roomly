import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

// Components
import Navbar from "./components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AddPropertyPage from "./pages/AddPropertyPage";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const normalizeToken = (value) => {
  if (!value || value === 'undefined' || value === 'null') {
    return null;
  }
  return value;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(normalizeToken(localStorage.getItem("roomly_token")));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me?token=${token}`);
          // L'API peut retourner {user: {...}} ou directement {...}
          const userData = response.data.user || response.data;
          setUser(userData);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("roomly_token");
          setToken(null);
          setUser(null);
        }
      } else if (localStorage.getItem("roomly_token")) {
        localStorage.removeItem("roomly_token");
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    const safeToken = normalizeToken(newToken);
    if (!safeToken) {
      localStorage.removeItem("roomly_token");
      throw new Error("Token invalide reçu du serveur");
    }
    localStorage.setItem("roomly_token", safeToken);
    setToken(safeToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post(`${API}/auth/register`, userData);
    const { token: newToken, user: newUser } = response.data;
    const safeToken = normalizeToken(newToken);
    if (!safeToken) {
      localStorage.removeItem("roomly_token");
      throw new Error("Token invalide reçu du serveur");
    }
    localStorage.setItem("roomly_token", safeToken);
    setToken(safeToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("roomly_token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const response = await axios.put(`${API}/auth/profile?token=${token}`, updates);
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, API }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "student" ? "/swipe" : "/dashboard"} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Ajouter la marge latérale uniquement si ce n'est pas la page swipe */}
        <div className="flex min-h-screen">
          <Navbar />
          <div className="flex-1 ml-0">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
          
          {/* Student routes */}
          <Route path="/swipe" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Landlord routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <LandlordDashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-property" element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <AddPropertyPage />
            </ProtectedRoute>
          } />
          <Route path="/edit-property/:id" element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <AddPropertyPage />
            </ProtectedRoute>
          } />
          
          {/* Shared routes */}
          <Route path="/matches" element={
            <ProtectedRoute>
              <MatchesPage />
            </ProtectedRoute>
          } />
          <Route path="/chat/:matchId" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/property/:id" element={
            <ProtectedRoute>
              <PropertyDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;

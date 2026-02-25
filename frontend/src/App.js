import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useState, useEffect, createContext, useContext } from "react";

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

// Mock Data
import { mockUser, mockStudentUser, mockProperties, mockMatches, mockMessages } from "./mockData";

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("roomly_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check with local data
    if (token) {
      setUser(localStorage.getItem("user_role") === "student" ? mockStudentUser : mockUser);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    // Mock login - accept any password for demo
    let userData;
    if (email.includes("student")) {
      userData = mockStudentUser;
      localStorage.setItem("user_role", "student");
    } else {
      userData = mockUser;
      localStorage.setItem("user_role", "landlord");
    }
    const token = "mock_token_" + Date.now();
    localStorage.setItem("roomly_token", token);
    setToken(token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    // Mock register
    const userRole = userData.email.includes("student") ? "student" : "landlord";
    const newUser = {
      ...mockUser,
      ...userData,
      id: Date.now().toString(),
      role: userRole,
    };
    const token = "mock_token_" + Date.now();
    localStorage.setItem("roomly_token", token);
    localStorage.setItem("user_role", userRole);
    setToken(token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("roomly_token");
    localStorage.removeItem("user_role");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, properties: mockProperties, matches: mockMatches, messages: mockMessages }}>
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
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;

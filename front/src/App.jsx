
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RoleSelection from "@/pages/RoleSelection";
import AuthCallback from "@/pages/AuthCallback";
import StudentOnboarding from "@/pages/StudentOnboarding";
import LandlordOnboarding from "@/pages/LandlordOnboarding";
import StudentDashboard from "@/pages/StudentDashboard";
import LandlordDashboard from "@/pages/LandlordDashboard";
import ListingForm from "@/pages/ListingForm";
import ListingDetail from "@/pages/ListingDetail";
import Messages from "@/pages/Messages";
import ProtectedRoute from "@/components/ProtectedRoute";

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id during render (prevents race conditions)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      
      {/* Protected Routes */}
      <Route path="/student/onboarding" element={
        <ProtectedRoute><StudentOnboarding /></ProtectedRoute>
      } />
      <Route path="/landlord/onboarding" element={
        <ProtectedRoute><LandlordOnboarding /></ProtectedRoute>
      } />
      <Route path="/student/dashboard" element={
        <ProtectedRoute><StudentDashboard /></ProtectedRoute>
      } />
      <Route path="/landlord/dashboard" element={
        <ProtectedRoute><LandlordDashboard /></ProtectedRoute>
      } />
      <Route path="/landlord/listing/new" element={
        <ProtectedRoute><ListingForm /></ProtectedRoute>
      } />
      <Route path="/landlord/listing/edit/:listingId" element={
        <ProtectedRoute><ListingForm /></ProtectedRoute>
      } />
      <Route path="/listing/:listingId" element={
        <ProtectedRoute><ListingDetail /></ProtectedRoute>
      } />
      <Route path="/messages/:matchId" element={
        <ProtectedRoute><Messages /></ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;

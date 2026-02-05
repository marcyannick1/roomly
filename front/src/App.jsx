
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
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
import ListingForm from "@/pages/ListingForm";
import LandlordListingForm from "@/pages/LandlordListingForm";
import ListingDetail from "@/pages/ListingDetail";
import Messages from "@/pages/Messages";
import UserProfile from "@/pages/UserProfile";
import ProtectedRoute from "@/components/ProtectedRoute";

// New modular dashboard
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeedPage from "@/pages/dashboard/FeedPage";
import MatchesPage from "@/pages/dashboard/MatchesPage";
import MessagesPage from "@/pages/dashboard/MessagesPage";
import VisitsPage from "@/pages/dashboard/VisitsPage";
import LikedPage from "@/pages/dashboard/LikedPage";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import ListingsPage from "@/pages/dashboard/ListingsPage";
import StudentsPage from "@/pages/dashboard/StudentsPage";

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

      {/* New modular dashboard routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardLayout /></ProtectedRoute>
      }>
        {/* Student routes */}
        <Route path="feed" element={<FeedPage />} />
        <Route path="liked" element={<LikedPage />} />
        
        {/* Landlord routes */}
        <Route path="listings" element={<ListingsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="listing/new" element={<LandlordListingForm />} />
        <Route path="listing/edit/:listingId" element={<ListingForm />} />
        
        {/* Common routes */}
        <Route path="matches" element={<MatchesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="visits" element={<VisitsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Legacy routes - TODO: migrate or remove */}
      <Route path="/listing/:listingId" element={
        <ProtectedRoute><ListingDetail /></ProtectedRoute>
      } />
      <Route path="/profile/:userId" element={
        <ProtectedRoute><UserProfile /></ProtectedRoute>
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

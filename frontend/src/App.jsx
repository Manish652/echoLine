import { Loader } from "lucide-react";
import { useEffect } from 'react';
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from 'react-router-dom';
import SidebarNavigation from './components/SidebarNavigation';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SignUppage from './pages/SignUppage.jsx';

function App() {
  const { authUser, isCheckingAuth } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    document.title = "echoLine - Modern Chat Application";
  }, []);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div data-theme={theme} className="flex h-screen overflow-hidden bg-base-100 text-base-content">
        <SidebarNavigation />
        <main className="flex-1 h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <SignUppage /> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profilepage" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;

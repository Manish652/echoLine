import { MessageSquare, Users, Settings, User, LogOut, LayoutGrid } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SidebarNavigation = () => {
  const { logout, authUser } = useAuth();
  const location = useLocation();

  if (!authUser) return null; // Don't show sidebar on login/signup

  return (
    <aside className="w-20 lg:w-24 h-screen bg-base-300 flex flex-col items-center py-6 border-r border-base-200 z-50 shrink-0">
      {/* Logo */}
      <Link to="/" className="mb-10 group">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex flex-col items-center justify-center text-primary group-hover:bg-primary transition-colors group-hover:text-primary-content">
          <LayoutGrid className="w-6 h-6" />
        </div>
      </Link>

      {/* Primary Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-6 w-full">
        <NavItem to="/" icon={<MessageSquare className="w-6 h-6" />} isActive={location.pathname === '/'} />
        <NavItem to="/features" icon={<Users className="w-6 h-6" />} isActive={location.pathname === '/features'} />
        <NavItem to="/profilepage" icon={<User className="w-6 h-6" />} isActive={location.pathname === '/profilepage'} />
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-6 mt-auto">
        <NavItem to="/settings" icon={<Settings className="w-6 h-6" />} isActive={location.pathname === '/settings'} />
        <button 
          onClick={logout}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-base-content/50 hover:bg-base-200 hover:text-error transition-all"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, isActive }) => {
  return (
    <Link 
      to={to} 
      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
        isActive 
          ? "bg-primary text-primary-content shadow-lg shadow-primary/30" 
          : "text-base-content/50 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      {icon}
    </Link>
  );
};

export default SidebarNavigation;

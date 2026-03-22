import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, LayoutGrid, Shield, Zap } from "lucide-react";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return toast.error("Please enter your email");
    if (!formData.password) return toast.error("Please enter your password");

    login(formData).catch(err => {
      toast.error(err.message || "Login failed. Please try again.");
    });
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col md:flex-row">
      {/* Left Pane - Branding (hidden on mobile) */}
      <div className="hidden md:flex flex-1 flex-col justify-center px-12 lg:px-24 bg-base-200">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">StreamChat</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Engineered for <br/>Continuous Flow.
          </h1>
          
          <p className="text-base-content/70 text-lg mb-12">
            The Living Stream. A high-performance engineering workspace designed for fluid collaboration and organic communication.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-base-100 rounded-xl p-5 shadow-sm">
              <Shield className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Secure by Design</h3>
              <p className="text-sm text-base-content/60">JWT-powered sessions with end-to-end encryption protocols.</p>
            </div>
            <div className="bg-base-100 rounded-xl p-5 shadow-sm">
              <Zap className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Real-time Pulse</h3>
              <p className="text-sm text-base-content/60">Sub-100ms latency across global engineering clusters.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-base-100">
        <div className="w-full max-w-md bg-base-200/50 p-8 rounded-3xl border border-base-300 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-base-content/60 text-sm">Access your workspace and start streaming.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">Work Email</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 w-full bg-base-300/50 border-base-300 focus:border-primary transition-colors"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">Password</label>
                <Link to="/signup" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 w-full bg-base-300/50 border-base-300 focus:border-primary transition-colors"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary rounded-md"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="text-sm text-base-content/70 font-medium">Keep me connected</span>
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full shadow-sm shadow-primary/20 text-primary-content"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Authenticate →"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-base-content/60">
            <span className="relative z-10 bg-base-200 px-3 uppercase tracking-wider text-xs font-semibold">Or continue with</span>
            <div className="absolute inset-x-8 top-[3.75rem] border-t border-base-300 -z-0"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button className="btn btn-outline border-base-300 hover:bg-base-300">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="btn btn-outline border-base-300 hover:bg-base-300">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-base-content/60">
            New to the stream?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Request Invitation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
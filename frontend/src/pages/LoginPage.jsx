import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-base-content/60 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-base-content/40" />
              </div>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-base-content/40" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 w-full"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span className="text-base-content/70">Remember me</span>
            </label>
            <Link to="/signup" className="text-primary hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full shadow-sm"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-base-content/60">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Camera, Eye, EyeOff, Loader2, Lock, Mail, LayoutGrid, Shield, Zap, User } from "lucide-react";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../lib/uploadImage";

const SignUppage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      setIsUploading(true);
      try {
        let imageUrl = undefined;
        if (selectedImage) {
          imageUrl = await uploadImage(selectedImage);
          if (!imageUrl) throw new Error("Failed to upload image");
        }
        
        const data = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          profilePic: imageUrl
        };
        await signup(data);
      } catch {
        toast.error("Signup failed");
      } finally {
        setIsUploading(false);
      }
    }
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
      <div className="flex-1 flex items-center justify-center p-6 bg-base-100 py-12">
        <div className="w-full max-w-md bg-base-200/50 p-8 rounded-3xl border border-base-300 shadow-xl mt-12 md:mt-0">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Request Invitation</h2>
            <p className="text-base-content/60 text-sm">Create your identity in the stream.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-base-300/50 flex items-center justify-center overflow-hidden border border-base-300">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-base-content/40" />
                  )}
                </div>
                <label
                  htmlFor="profilePic"
                  className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md shadow-primary/30 hover:bg-primary-focus transition-colors"
                  title="Upload avatar"
                >
                  <Camera className="w-3 h-3 text-primary-content" />
                </label>
                <input
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">Full Name</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Alex Sterling"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="pl-10 w-full bg-base-300/50 border-base-300 focus:border-primary transition-colors"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">Work Email</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="alex@engineering.io"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 w-full bg-base-300/50 border-base-300 focus:border-primary transition-colors"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-base-content/70 uppercase">Password</label>
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

            <button
              type="submit"
              className="btn btn-primary w-full shadow-sm shadow-primary/20 text-primary-content mt-4"
              disabled={isSigningUp || isUploading}
            >
              {isSigningUp || isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {isUploading ? "Processing..." : "Initializing..."}
                </>
              ) : (
                "Initialize Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-base-content/60">
            Already in the stream?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Authenticate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUppage;

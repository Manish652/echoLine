import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Camera, Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-base-content/60 text-sm">Join our community today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center overflow-hidden border-2 border-base-300">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-base-content/50" />
                )}
              </div>
              <label
                htmlFor="profilePic"
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                title="Upload profile picture"
              >
                <Camera className="w-3.5 h-3.5 text-primary-content" />
              </label>
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-base-content/60">Profile Picture (Optional)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-base-content/40" />
              </div>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="pl-10 w-full"
              />
            </div>
          </div>

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

          <button
            type="submit"
            className="btn btn-primary w-full shadow-sm mt-2"
            disabled={isSigningUp || isUploading}
          >
            {isSigningUp || isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {isUploading ? "Uploading image..." : "Creating account..."}
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-base-content/60">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUppage;

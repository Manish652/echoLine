import { Camera, Shield, Mail, Phone, Lock, Eye, MonitorSmartphone, Smartphone, CheckCircle2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../lib/imageUtils";
import { uploadImage } from "../lib/uploadImage";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuth();
  const [selectedImg, setSelectedImg] = useState(null);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || ""
  });

  useEffect(() => {
    if (authUser?.profilepic) {
      setSelectedImg(getImageUrl(authUser.profilepic));
    }
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || "",
        email: authUser.email || ""
      });
    }
  }, [authUser]);

  const handleSaveChanges = async () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    try {
      await updateProfile(formData);
    } catch (error) {
       // handled in context
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedImg(reader.result);
    };

    try {
      const imageUrl = await uploadImage(file);
      if (!imageUrl) throw new Error("Image upload failed");
      await updateProfile({ profilePic: imageUrl });
    } catch {
      toast.error("Failed to update profile picture. Please try again.");
      setSelectedImg(authUser?.profilepic ? getImageUrl(authUser.profilepic) : null);
    }
  };

  return (
    <div className="min-h-full bg-base-100 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Top User Header Card */}
        <div className="bg-base-200/50 border border-base-300 rounded-3xl p-8 mb-8 flex items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-base-100 bg-base-300">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${authUser?.fullName || 'User'}`}
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-1 right-1 
                bg-primary hover:bg-primary-focus
                p-2 rounded-full cursor-pointer shadow-lg
                transition-all duration-200 transform
                group-hover:scale-110 border-2 border-base-100
                ${isUpdatingProfile ? "animate-pulse pointer-events-none opacity-70" : ""}
              `}
            >
              <Camera className="w-4 h-4 text-primary-content" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{authUser?.fullName || "User"}</h1>
            <p className="text-base-content/60 text-sm flex items-center gap-2">
              @{authUser?.fullName?.toLowerCase().replace(/\s+/g, '_') || "user"} • Engineering Lead
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Profile Identity */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-base-content/80">
                <UserIcon /> 
                <h2 className="text-lg font-bold">Profile Identity</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wide text-base-content/60 uppercase">Full Name</label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-base-200/50 p-3 rounded-xl border border-base-300 focus:border-primary outline-none transition-colors font-medium text-sm"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wide text-base-content/60 uppercase">Email (Username)</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-base-200/50 p-3 rounded-xl border border-base-300 focus:border-primary outline-none transition-colors font-medium text-sm text-primary"
                    placeholder="Enter work email"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-1">
                <label className="text-xs font-semibold tracking-wide text-base-content/60 uppercase">Status Message</label>
                <div className="bg-base-200/50 p-3 rounded-xl border border-base-300">
                  <span className="font-medium text-sm">Optimizing the stream flow 🌊 | Engineering Workspace</span>
                </div>
              </div>
            </div>

            {/* Privacy & Access */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-base-content/80 mt-10">
                <Shield className="w-5 h-5 text-primary" /> 
                <h2 className="text-lg font-bold">Privacy & Access</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-base-200/50 p-4 rounded-xl border border-base-300 flex items-center justify-between cursor-pointer hover:bg-base-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-base-100 rounded-lg">
                      <Lock className="w-5 h-5 text-base-content/70" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Change Password</h4>
                      <p className="text-xs text-base-content/60 mt-0.5">Last updated 4 months ago</p>
                    </div>
                  </div>
                  <ChevronRightIcon />
                </div>
                
                <div className="bg-base-200/50 p-4 rounded-xl border border-base-300 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-base-100 rounded-lg">
                      <Eye className="w-5 h-5 text-base-content/70" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Profile Visibility</h4>
                      <p className="text-xs text-base-content/60 mt-0.5">Visible to all workspace members</p>
                    </div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleSaveChanges} 
                  disabled={isUpdatingProfile}
                  className="btn btn-primary shadow-sm shadow-primary/20 text-primary-content px-6"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  onClick={() => setFormData({ fullName: authUser?.fullName || "", email: authUser?.email || "" })}
                  className="btn btn-ghost bg-base-200/50 border border-base-300 hover:bg-base-300"
                >
                  Discard
                </button>
              </div>
            </div>
            
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Workspace Engagement */}
            <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300">
              <h3 className="text-xs font-semibold tracking-wide text-base-content/60 uppercase mb-4">Workspace Engagement</h3>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-4xl font-bold text-primary">1,284</span>
                <span className="text-sm font-medium text-base-content/70 mb-1">Messages Sent</span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-1.5 mt-2">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-base-200/30 p-5 rounded-2xl border border-base-300">
                <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-lg mb-0.5">Pro</h3>
                <p className="text-xs text-base-content/60">Account Type</p>
              </div>
              <div className="bg-base-200/30 p-5 rounded-2xl border border-base-300">
                <Zap className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-lg mb-0.5">Top 5%</h3>
                <p className="text-xs text-base-content/60">Contributors</p>
              </div>
            </div>

            {/* Active Devices */}
            <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300 mt-6">
              <h3 className="font-bold mb-4">Active Devices</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <MonitorSmartphone className="w-6 h-6 text-base-content/50" />
                  <div>
                    <h4 className="text-sm font-medium">MacBook Pro 16"</h4>
                    <p className="text-xs text-primary mt-0.5">Current Session</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Smartphone className="w-6 h-6 text-base-content/50" />
                  <div>
                    <h4 className="text-sm font-medium">iPhone 15 Pro</h4>
                    <p className="text-xs text-base-content/60 mt-0.5">Last active 2h ago</p>
                  </div>
                </div>
              </div>
              <button className="w-full text-center text-xs font-medium text-error mt-6 hover:underline">
                Logout of all devices
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content/40">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default ProfilePage;
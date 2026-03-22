import { Monitor, Moon, Sun, MonitorSmartphone, Bell, HardDrive, Trash2, Power } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const THEME_OPTIONS = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "system", label: "System", icon: Monitor },
];

const ACCENT_COLORS = [
  { id: "primary", color: "bg-[#00D2A0]", value: "166 100% 41%" },
  { id: "blue", color: "bg-[#3B82F6]", value: "217 91% 60%" },
  { id: "purple", color: "bg-[#8B5CF6]", value: "258 90% 66%" },
  { id: "pink", color: "bg-[#EC4899]", value: "330 81% 60%" },
  { id: "orange", color: "bg-[#F97316]", value: "25 95% 53%" },
];

const SettingsPage = () => {
  const { theme, setTheme, fontSize, setFontSize, accentColor, setAccentColor } = useTheme();

  return (
    <div className="min-h-full bg-base-100 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">App Settings</h1>
            <p className="text-base-content/60 text-sm">Configure your StreamChat environment for peak performance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Appearance */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-base-content/80">
                <PaletteIcon />
                <h2 className="text-lg font-bold">Appearance</h2>
              </div>
              <div className="bg-base-200/50 p-6 rounded-2xl border border-base-300">
                <h3 className="text-xs font-semibold tracking-wide text-base-content/60 uppercase mb-4">Theme Mode</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = theme === opt.id || (opt.id === "system" && !["light", "dark"].includes(theme));
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          isActive 
                            ? "bg-base-100 border-primary text-primary shadow-sm" 
                            : "bg-base-200/50 border-base-300 text-base-content/60 hover:bg-base-200"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-semibold tracking-wide text-base-content/60 uppercase w-24">Accent Color</h3>
                  <div className="flex items-center gap-2 flex-1">
                    {ACCENT_COLORS.map((color, i) => (
                      <button 
                        key={color.id}
                        onClick={() => setAccentColor(color.value)}
                        className={`w-8 h-8 rounded-full ${color.color} flex items-center justify-center ${accentColor === color.value || (!accentColor && i === 0) ? "ring-2 ring-primary ring-offset-2 ring-offset-base-200" : "opacity-70 hover:opacity-100"}`}
                      >
                        {(accentColor === color.value || (!accentColor && i === 0)) && <CheckIcon />}
                      </button>
                    ))}
                    <button 
                      className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center ml-2 border border-base-content/20 text-base-content/50 hover:bg-base-200"
                      onClick={() => setAccentColor(null)}
                      title="Reset Default"
                    >
                      <EditIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-base-content/80 mt-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Notifications</h2>
              </div>
              <div className="bg-base-200/50 p-2 rounded-2xl border border-base-300">
                <div className="flex items-center justify-between p-4 border-b border-base-300/50">
                   <div className="flex items-center gap-3">
                      <MonitorSmartphone className="w-5 h-5 text-base-content/60" />
                      <div>
                        <h4 className="text-sm font-medium">Desktop Notifications</h4>
                        <p className="text-xs text-base-content/60">Show alerts on your desktop</p>
                      </div>
                   </div>
                   <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4">
                   <div className="flex items-center gap-3">
                      <VolumeIcon />
                      <div>
                        <h4 className="text-sm font-medium">Sound Effects</h4>
                        <p className="text-xs text-base-content/60">Play sounds for new messages</p>
                      </div>
                   </div>
                   <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Accessibility */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-base-content/80">
                <AccessibilityIcon />
                <h2 className="text-lg font-bold">Accessibility</h2>
              </div>
              <div className="bg-base-200/50 p-6 rounded-2xl border border-base-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-semibold tracking-wide text-base-content/60 uppercase">Font Size</h3>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">{fontSize}px</span>
                </div>
                
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="range range-primary range-xs mb-2"
                  step="1"
                />
                <div className="flex justify-between text-xs text-base-content/50 uppercase font-semibold tracking-wider">
                  <span>Small</span>
                  <span>Large</span>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <h3 className="text-sm font-medium">High Contrast</h3>
                  <input type="checkbox" className="toggle toggle-sm" />
                </div>
              </div>
            </div>

            {/* Storage & Data */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-base-content/80 mt-2">
                <HardDrive className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Storage & Data</h2>
              </div>
              <div className="bg-base-200/50 p-6 rounded-2xl border border-base-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-base-content/60 uppercase mb-1">Cache Usage</h3>
                    <p className="text-2xl font-bold">1.24 GB</p>
                  </div>
                  <button className="btn btn-sm btn-outline border-error text-error hover:bg-error hover:text-error-content hover:border-error">Clear Cache</button>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-base-300/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-base-content/60 uppercase font-semibold mb-1">Media</p>
                    <p className="font-bold">856 MB</p>
                  </div>
                  <div className="flex-1 bg-base-300/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-base-content/60 uppercase font-semibold mb-1">Messages</p>
                    <p className="font-bold">42 MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 pt-6 border-t border-base-200">
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-error font-bold flex items-center gap-2 mb-1">
                     <AlertCircleIcon />
                     Danger Zone
                   </h3>
                   <p className="text-xs text-base-content/60">Irreversible actions for your account and data.</p>
                 </div>
                 <div className="flex gap-2">
                   <button className="btn btn-sm btn-ghost text-error">Deactivate Account</button>
                   <button className="btn btn-sm bg-error/10 text-error hover:bg-error hover:text-error-content border-none">Delete Everything</button>
                 </div>
               </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button className="btn btn-ghost hover:bg-base-200">Discard Changes</button>
              <button className="btn btn-primary shadow-sm shadow-primary/20 text-primary-content px-6">Save Preferences</button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// Custom icons that are smaller/specific
const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
);

const AccessibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);

const VolumeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-base-content/60"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default SettingsPage;
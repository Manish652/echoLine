import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { authAPI } from '../lib/api';

const AuthContext = createContext();
const SocketContext = createContext();

const BASE_URL = "http://localhost:3000";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const connectSocket = (user) => {
    // Don't connect if no user or socket already connected
    if (!user || socket?.connected) return;

    console.log("Connecting socket for user:", user._id);

    const newSocket = io(BASE_URL, {
      path: "/socket.io",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("setup", user._id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setOnlineUsers([]);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("👥 Online users:", userIds.length);
      setOnlineUsers(userIds.filter(id => id !== user._id));
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket?.connected) {
      console.log("Disconnecting socket...");
      socket.emit("userOffline", authUser?._id);
      socket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await authAPI.checkAuth();
      setAuthUser(res.data);
      // Only connect socket if user was already logged in (has valid session)
      // This prevents socket connection on initial page load for non-authenticated users
      if (res.data) {
        connectSocket(res.data);
      }
    } catch (error) {
      setAuthUser(null);
      // Don't log 401 errors (expected for non-authenticated users)
      if (error?.response?.status !== 401 && error?.message !== 'Network Error') {
        console.error("CheckAuth failed:", error?.response?.data);
      }
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const signup = async (data) => {
    setIsSigningUp(true);
    try {
      const res = await authAPI.signup(data);
      setAuthUser(res.data);
      toast.success("Account created successfully");
      connectSocket(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error creating account");
    } finally {
      setIsSigningUp(false);
    }
  };

  const login = async (data) => {
    setIsLoggingIn(true);
    try {
      const res = await authAPI.login(data);
      setAuthUser(res.data);
      toast.success("Logged in successfully");
      connectSocket(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setAuthUser(null);
      toast.success("Logged out successfully");
      disconnectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  const updateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const res = await authAPI.updateProfile(data);
      setAuthUser(res.data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    // Only check auth on mount, don't connect socket here
    checkAuth();

    // Cleanup: disconnect socket when component unmounts
    return () => {
      if (socket?.connected) {
        disconnectSocket();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authValue = {
    authUser,
    isCheckingAuth,
    isLoggingIn,
    isSigningUp,
    isUpdatingProfile,
    onlineUsers,
    signup,
    login,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={authValue}>
      <SocketContext.Provider value={socket}>
        {children}
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
};

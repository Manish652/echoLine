import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { messagesAPI } from '../lib/api';
import { useAuth, useSocket } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const { authUser } = useAuth();
  const socket = useSocket();

  const getUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await messagesAPI.getUsers();
      setUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (userId) => {
    if (!userId) {
      setMessages([]);
      setIsMessagesLoading(false);
      return;
    }

    setIsMessagesLoading(true);
    try {
      const res = await messagesAPI.getMessages(userId);
      setMessages(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      setMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const selectUser = useCallback((user) => {
    setSelectedUser(user);
    if (user?._id) {
      getMessages(user._id);
    } else {
      setMessages([]);
    }
  }, [getMessages]);

  const sendMessage = useCallback(async (messageData) => {
    if (!selectedUser?._id) return;

    try {
      const res = await messagesAPI.sendMessage(selectedUser._id, messageData);
      setMessages(prev => [...prev, res.data]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleNewMessage = (message) => {
      if (message.senderId._id === authUser._id) return;
      if (selectedUser?._id === message.senderId._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          return exists ? prev : [...prev, message];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    isUsersLoading,
    isMessagesLoading,
    getUsers,
    getMessages,
    selectUser,
    sendMessage,
    setMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

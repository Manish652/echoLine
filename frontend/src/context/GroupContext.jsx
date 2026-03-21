import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { groupsAPI } from '../lib/api';
import { useSocket } from './AuthContext';

const GroupContext = createContext();

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup must be used within GroupProvider');
  return context;
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const socket = useSocket();

  const getGroups = useCallback(async () => {
    setIsGroupsLoading(true);
    try {
      const res = await groupsAPI.getUserGroups();
      setGroups(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      setIsGroupsLoading(false);
    }
  }, []);

  const getGroupMessages = useCallback(async (groupId) => {
    if (!groupId) {
      setGroupMessages([]);
      setIsMessagesLoading(false);
      return;
    }

    setIsMessagesLoading(true);
    try {
      const res = await groupsAPI.getGroupMessages(groupId);
      setGroupMessages(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch group messages");
      setGroupMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const selectGroup = useCallback((group) => {
    setSelectedGroup(group);
    if (group?._id) {
      getGroupMessages(group._id);
    } else {
      setGroupMessages([]);
    }
  }, [getGroupMessages]);

  const createGroup = useCallback(async (formData) => {
    setIsCreatingGroup(true);
    try {
      const res = await groupsAPI.createGroup(formData);
      setGroups(prev => [res.data, ...prev]);
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    } finally {
      setIsCreatingGroup(false);
    }
  }, []);

  const sendGroupMessage = useCallback(async (messageData) => {
    if (!selectedGroup?._id) return;

    try {
      const res = await groupsAPI.sendGroupMessage(selectedGroup._id, messageData);
      setGroupMessages(prev => {
        const exists = prev.some(m => m._id === res.data._id);
        return exists ? prev : [...prev, res.data];
      });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error;
    }
  }, [selectedGroup]);

  const addGroupMembers = useCallback(async (groupId, userIds) => {
    try {
      const res = await groupsAPI.addGroupMember(groupId, userIds);
      setGroups(prev => prev.map(group => 
        group._id === groupId ? res.data : group
      ));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(res.data);
      }
      toast.success("Members added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
      throw error;
    }
  }, [selectedGroup]);

  const removeGroupMember = useCallback(async (groupId, userId) => {
    try {
      await groupsAPI.removeGroupMember(groupId, userId);
      setGroups(prev => prev.map(group => 
        group._id === groupId 
          ? { ...group, members: group.members.filter(m => m.user._id !== userId) }
          : group
      ));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(prev => ({
          ...prev,
          members: prev.members.filter(m => m.user._id !== userId)
        }));
      }
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
      throw error;
    }
  }, [selectedGroup]);

  const leaveGroup = useCallback(async (groupId) => {
    try {
      await groupsAPI.leaveGroup(groupId);
      setGroups(prev => prev.filter(group => group._id !== groupId));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
        setGroupMessages([]);
      }
      toast.success("Left group successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
      throw error;
    }
  }, [selectedGroup]);

  const deleteGroup = useCallback(async (groupId) => {
    try {
      await groupsAPI.deleteGroup(groupId);
      setGroups(prev => prev.filter(group => group._id !== groupId));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
        setGroupMessages([]);
      }
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
      throw error;
    }
  }, [selectedGroup]);

  const updateGroupSettings = useCallback(async (groupId, formData) => {
    try {
      const res = await groupsAPI.updateGroupSettings(groupId, formData);
      setGroups(prev => prev.map(group => 
        group._id === groupId ? res.data : group
      ));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(res.data);
      }
      toast.success("Group updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
      throw error;
    }
  }, [selectedGroup]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewGroupMessage = (message) => {
      if (selectedGroup?._id === message.groupId) {
        setGroupMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          return exists ? prev : [...prev, message];
        });
      }
    };

    const handleNewGroup = (group) => {
      setGroups(prev => {
        const exists = prev.some(g => g._id === group._id);
        return exists ? prev.map(g => g._id === group._id ? group : g) : [group, ...prev];
      });
    };

    const handleGroupUpdated = (updatedGroup) => {
      setGroups(prev => prev.map(group => 
        group._id === updatedGroup._id ? updatedGroup : group
      ));
      if (selectedGroup?._id === updatedGroup._id) {
        setSelectedGroup(updatedGroup);
      }
    };

    const handleGroupDeleted = ({ groupId }) => {
      setGroups(prev => prev.filter(group => group._id !== groupId));
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
        setGroupMessages([]);
      }
    };

    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("newGroup", handleNewGroup);
    socket.on("groupUpdated", handleGroupUpdated);
    socket.on("groupDeleted", handleGroupDeleted);

    return () => {
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("newGroup", handleNewGroup);
      socket.off("groupUpdated", handleGroupUpdated);
      socket.off("groupDeleted", handleGroupDeleted);
    };
  }, [socket, selectedGroup]);

  // Cleanly handle joining and leaving group socket rooms
  useEffect(() => {
    if (!socket || !selectedGroup?._id) return;
    
    socket.emit("joinGroup", selectedGroup._id);

    return () => {
      socket.emit("leaveGroup", selectedGroup._id);
    };
  }, [socket, selectedGroup?._id]);

  const value = {
    groups,
    selectedGroup,
    groupMessages,
    isGroupsLoading,
    isMessagesLoading,
    isCreatingGroup,
    getGroups,
    getGroupMessages,
    selectGroup,
    createGroup,
    sendGroupMessage,
    addGroupMembers,
    removeGroupMember,
    leaveGroup,
    deleteGroup,
    updateGroupSettings,
    setGroupMessages
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

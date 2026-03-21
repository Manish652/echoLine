
import { getReceiverSocketId } from '../config/socket.js';
import { io } from '../index.js';
import Group from '../models/group.model.js';
import GroupMessage from '../models/groupMessage.model.js';
import User from '../models/user.model.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const adminId = req.user._id;

    // Validation
    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (name.length > 50) {
      return res.status(400).json({ message: "Group name must be less than 50 characters" });
    }

    const groupPicture = req.body.groupPicture || "";

    // Create group with admin as first member
    const groupData = {
      name,
      description: description || '',
      groupPicture,
      admin: adminId,
      members: [{ user: adminId, role: 'admin' }]
    };

    // Add other members if provided
    if (members && Array.isArray(members)) {
      const validMembers = members.filter(memberId =>
        memberId && memberId.toString() !== adminId.toString()
      );

      // Validate that members exist
      const existingUsers = await User.find({ _id: { $in: validMembers } });
      validMembers.forEach(memberId => {
        if (existingUsers.some(user => user._id.toString() === memberId.toString())) {
          groupData.members.push({ user: memberId, role: 'member' });
        }
      });
    }

    const group = await Group.create(groupData);

    // Populate group data
    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'fullName profilepic')
      .populate('members.user', 'fullName profilepic');

    // Send system message
    const systemMessage = await GroupMessage.create({
      groupId: group._id,
      senderId: adminId,
      messageType: 'system',
      systemMessage: `${req.user.fullName} created the group`
    });

    // Notify all members
    populatedGroup.members.forEach(member => {
      const socketId = getReceiverSocketId(member.user._id);
      if (socketId) {
        io.to(socketId).emit("newGroup", populatedGroup);
        io.to(`group_${group._id}`).emit("newGroupMessage", systemMessage);
      }
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      'members.user': userId,
      isActive: true
    })
      .populate('admin', 'fullName profilepic')
      .populate('members.user', 'fullName profilepic')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate('senderId', 'fullName profilepic')
      .populate('replyTo')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image, replyTo } = req.body;
    const senderId = req.user._id;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(senderId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    let imageUrl = image;

    const messageData = {
      groupId,
      senderId,
      text,
      image: imageUrl,
      messageType: image ? 'image' : 'text',
      replyTo
    };

    const newMessage = await GroupMessage.create(messageData);

    // Update group's last message
    await Group.findByIdAndUpdate(groupId, { lastMessage: newMessage._id });

    // Populate message data
    const populatedMessage = await GroupMessage.findById(newMessage._id)
      .populate('senderId', 'fullName profilepic')
      .populate('replyTo');

    // Notify all group members
    io.to(`group_${groupId}`).emit("newGroupMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    const adminId = req.user._id;

    // Check if user is admin of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isAdmin(adminId)) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: "User IDs are required" });
    }

    // Validate that users exist
    const existingUsers = await User.find({ _id: { $in: userIds } });
    const validUserIds = existingUsers.map(user => user._id);

    // Add new members
    const addedMembers = [];
    for (const userId of validUserIds) {
      if (!group.isMember(userId)) {
        group.members.push({ user: userId, role: 'member' });
        addedMembers.push(userId);
      }
    }

    await group.save();

    // Send system messages for new members
    for (const userId of addedMembers) {
      const user = existingUsers.find(u => u._id.toString() === userId.toString());
      const systemMessage = await GroupMessage.create({
        groupId,
        senderId: adminId,
        messageType: 'system',
        systemMessage: `${user.fullName} was added to the group`
      });

      // Notify all members
      group.members.forEach(member => {
        const socketId = getReceiverSocketId(member.user._id);
        if (socketId) {
          io.to(socketId).emit("newGroupMessage", systemMessage);
          io.to(socketId).emit("groupMemberAdded", { groupId, member: user });
        }
      });
    }

    // Return updated group
    const updatedGroup = await Group.findById(groupId)
      .populate('admin', 'fullName profilepic')
      .populate('members.user', 'fullName profilepic');

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in addGroupMember:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const adminId = req.user._id;

    // Check if user is admin of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isAdmin(adminId)) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    // Cannot remove admin
    if (group.admin.toString() === userId) {
      return res.status(400).json({ message: "Cannot remove group admin" });
    }

    // Check if user is member
    if (!group.isMember(userId)) {
      return res.status(404).json({ message: "User is not a member of this group" });
    }

    // Remove member
    await group.removeMember(userId);

    // Get user details for system message
    const user = await User.findById(userId);
    const systemMessage = await GroupMessage.create({
      groupId,
      senderId: adminId,
      messageType: 'system',
      systemMessage: `${user.fullName} was removed from the group`
    });

    // Notify all members
    group.members.forEach(member => {
      const socketId = getReceiverSocketId(member.user._id);
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", systemMessage);
        io.to(socketId).emit("groupMemberRemoved", { groupId, userId });
      }
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error in removeGroupMember:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is member
    if (!group.isMember(userId)) {
      return res.status(404).json({ message: "You are not a member of this group" });
    }

    // Admin cannot leave if there are other members
    if (group.isAdmin(userId) && group.members.length > 1) {
      return res.status(400).json({ message: "Admin cannot leave group with other members. Transfer admin rights first." });
    }

    // Remove member
    await group.removeMember(userId);

    // Send system message
    const systemMessage = await GroupMessage.create({
      groupId,
      senderId: userId,
      messageType: 'system',
      systemMessage: `${req.user.fullName} left the group`
    });

    // If admin left and was the only member, delete the group
    if (group.isAdmin(userId) && group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      await GroupMessage.deleteMany({ groupId });

      // Notify members (should be none, but just in case)
      group.members.forEach(member => {
        const socketId = getReceiverSocketId(member.user._id);
        if (socketId) {
          io.to(socketId).emit("groupDeleted", { groupId });
        }
      });

      return res.status(200).json({ message: "Group deleted as you were the only member" });
    }

    // Notify all remaining members
    group.members.forEach(member => {
      const socketId = getReceiverSocketId(member.user._id);
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", systemMessage);
        io.to(socketId).emit("groupMemberLeft", { groupId, userId });
      }
    });

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const adminId = req.user._id;

    // Check if user is admin of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isAdmin(adminId)) {
      return res.status(403).json({ message: "Only admin can delete the group" });
    }

    // Notify all members before deletion
    group.members.forEach(member => {
      const socketId = getReceiverSocketId(member.user._id);
      if (socketId) {
        io.to(socketId).emit("groupDeleted", { groupId });
      }
    });

    // Delete all messages and group
    await GroupMessage.deleteMany({ groupId });
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroupSettings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const adminId = req.user._id;

    // Check if user is admin of the group
    const group = await Group.findById(groupId);
    if (!group || !group.isAdmin(adminId)) {
      return res.status(403).json({ message: "Only admin can update group settings" });
    }

    // Update group
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (req.body.groupPicture) {
      updateData.groupPicture = req.body.groupPicture;
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true }
    )
      .populate('admin', 'fullName profilepic')
      .populate('members.user', 'fullName profilepic');

    // Notify all members
    updatedGroup.members.forEach(member => {
      const socketId = getReceiverSocketId(member.user._id);
      if (socketId) {
        io.to(socketId).emit("groupUpdated", updatedGroup);
      }
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroupSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

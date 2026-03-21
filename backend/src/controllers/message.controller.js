
import { getReceiverSocketId } from '../config/socket.js';
import { io } from '../index.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUserForSidebar:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId: userToChatId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ]
        })
            .populate('senderId', 'profilepic fullName')
            .populate('receiverId', 'profilepic fullName');

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = image;

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'profilepic fullName')
            .populate('receiverId', 'profilepic fullName');

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

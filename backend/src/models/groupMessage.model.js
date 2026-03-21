import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text'
  },
  systemMessage: {
    type: String, // For system messages like "User joined the group"
    default: ''
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupMessage'
  }
}, {
  timestamps: true
});

// Index for better performance
groupMessageSchema.index({ groupId: 1, createdAt: -1 });
groupMessageSchema.index({ senderId: 1 });

// Virtual for formatted time
groupMessageSchema.virtual('formattedTime').get(function () {
  return this.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;

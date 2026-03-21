import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  groupPicture: {
    type: String,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ admin: 1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

// Method to check if user is member
groupSchema.methods.isMember = function (userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is admin
groupSchema.methods.isAdmin = function (userId) {
  return this.admin.toString() === userId.toString();
};

// Method to add member
groupSchema.methods.addMember = function (userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({ user: userId, role });
  }
  return this.save();
};

// Method to remove member
groupSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
  return this.save();
};

// Method to update member role
groupSchema.methods.updateMemberRole = function (userId, newRole) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  if (member) {
    member.role = newRole;
  }
  return this.save();
};

const Group = mongoose.model('Group', groupSchema);

export default Group;

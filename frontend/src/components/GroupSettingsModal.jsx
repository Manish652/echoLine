import { useState, useRef } from 'react';
import { FiX, FiUsers, FiSettings, FiImage, FiType, FiTrash2, FiUserMinus, FiShield } from 'react-icons/fi';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../lib/uploadImage';

const GroupSettingsModal = ({ isOpen, onClose, group }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPicture, setGroupPicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeTab, setActiveTab] = useState('settings');
  const fileInputRef = useRef(null);

  const {
    updateGroupSettings,
    removeGroupMember,
    leaveGroup,
    deleteGroup
  } = useGroup();
  const { authUser } = useAuth();

  const isAdmin = group?.admin?._id === authUser?._id;
  const isMember = group?.members?.some(m => m.user._id === authUser?._id);

  // Initialize form data when group changes
  useState(() => {
    if (group) {
      setGroupName(group.name || '');
      setGroupDescription(group.description || '');
      setPreviewUrl(group.groupPicture || '');
    }
  }, [group]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setGroupPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      let groupPictureUrl = undefined;
      if (groupPicture) {
        groupPictureUrl = await uploadImage(groupPicture);
        if (!groupPictureUrl) throw new Error("Image upload failed");
      }

      const data = {
        name: groupName.trim(),
        description: groupDescription.trim()
      };
      if (groupPictureUrl) data.groupPicture = groupPictureUrl;

      await updateGroupSettings(group._id, data);

      // Reset picture state
      setGroupPicture(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await removeGroupMember(group._id, memberId);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      await leaveGroup(group._id);
      onClose();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    if (!confirm('This will permanently delete the group and all messages. Are you absolutely sure?')) return;

    try {
      await deleteGroup(group._id);
      onClose();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiSettings className="w-5 h-5" />
            Group Settings
          </h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'settings'
              ? 'border-b-2 border-primary text-primary'
              : 'text-base-content/70 hover:text-base-content'
              }`}
          >
            <FiSettings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'members'
              ? 'border-b-2 border-primary text-primary'
              : 'text-base-content/70 hover:text-base-content'
              }`}
          >
            <FiUsers className="w-4 h-4 inline mr-2" />
            Members ({group.members?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'settings' && (
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              {/* Group Picture */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Group preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage className="w-8 h-8 text-base-content/50" />
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 btn btn-xs btn-circle btn-primary"
                    >
                      <FiImage className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!isAdmin}
                />
                <p className="text-xs text-base-content/50 mt-2">
                  {isAdmin ? 'Click to change group picture' : 'Only admin can change picture'}
                </p>
              </div>

              {/* Group Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <FiType className="w-4 h-4" />
                    Group Name
                  </span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="input input-bordered w-full"
                  maxLength={50}
                  disabled={!isAdmin}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    {groupName.length}/50 characters
                  </span>
                </label>
              </div>

              {/* Group Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="What's this group about?"
                  className="textarea textarea-bordered w-full resize-none"
                  rows={3}
                  maxLength={200}
                  disabled={!isAdmin}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    {groupDescription.length}/200 characters
                  </span>
                </label>
              </div>

              {/* Admin Info */}
              <div className="alert alert-info">
                <FiShield className="w-4 h-4" />
                <span>
                  Created by <strong>{group.admin?.fullName}</strong> on{' '}
                  {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Update Button */}
              {isAdmin && (
                <button type="submit" className="btn btn-primary w-full">
                  Update Settings
                </button>
              )}
            </form>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2">
              {group.members?.map(member => (
                <div
                  key={member.user._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-base-200"
                >
                  <div className="relative">
                    <img
                      src={member.user.profilepic || '/avatar.png'}
                      alt={member.user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {member.user._id === group.admin._id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <FiShield className="w-2 h-2 text-primary-content" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.user.fullName}</p>
                    <p className="text-xs text-base-content/50">
                      {member.user._id === group.admin._id ? 'Admin' : 'Member'} •
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {isAdmin && member.user._id !== authUser._id && member.user._id !== group.admin._id && (
                    <button
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="btn btn-sm btn-ghost btn-circle text-error"
                      title="Remove member"
                    >
                      <FiUserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-base-300 p-4 space-y-2">
          {isMember && !isAdmin && (
            <button
              onClick={handleLeaveGroup}
              className="btn btn-outline w-full"
            >
              Leave Group
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={handleDeleteGroup}
                className="btn btn-error w-full"
              >
                <FiTrash2 className="w-4 h-4 mr-2" />
                Delete Group
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;

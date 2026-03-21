import { useState, useRef } from 'react';
import { FiX, FiUsers, FiImage, FiType } from 'react-icons/fi';
import { useGroup } from '../context/GroupContext';
import { useChat } from '../context/ChatContext';
import { uploadImage } from '../lib/uploadImage';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupPicture, setGroupPicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const { createGroup, isCreatingGroup } = useGroup();
  const { users } = useChat();

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

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      let groupPictureUrl = "";
      if (groupPicture) {
        groupPictureUrl = await uploadImage(groupPicture);
        if (!groupPictureUrl) throw new Error("Image upload failed");
      }

      const data = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        groupPicture: groupPictureUrl,
        members: selectedMembers
      };

      await createGroup(data);
      
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      setGroupPicture(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleClose = () => {
    if (!isCreatingGroup) {
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers([]);
      setGroupPicture(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiUsers className="w-5 h-5" />
            Create New Group
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreatingGroup}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 btn btn-xs btn-circle btn-primary"
              >
                <FiImage className="w-3 h-3" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-base-content/50 mt-2">Click to add group picture</p>
          </div>

          {/* Group Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiType className="w-4 h-4" />
                Group Name *
              </span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="input input-bordered w-full"
              maxLength={50}
              required
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
              <span className="label-text font-medium">Description (Optional)</span>
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What's this group about?"
              className="textarea textarea-bordered w-full resize-none"
              rows={3}
              maxLength={200}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                {groupDescription.length}/200 characters
              </span>
            </label>
          </div>

          {/* Select Members */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FiUsers className="w-4 h-4" />
                Add Members ({selectedMembers.length})
              </span>
            </label>
            <div className="max-h-40 overflow-y-auto border border-base-300 rounded-lg p-2 space-y-1">
              {users.length === 0 ? (
                <p className="text-center text-base-content/50 py-4">No users available</p>
              ) : (
                users.map(user => (
                  <label
                    key={user._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => handleMemberToggle(user._id)}
                      className="checkbox checkbox-sm"
                    />
                    <img
                      src={user.profilepic || '/avatar.png'}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="flex-1">{user.fullName}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreatingGroup}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingGroup || !groupName.trim()}
              className="btn btn-primary flex-1"
            >
              {isCreatingGroup ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;

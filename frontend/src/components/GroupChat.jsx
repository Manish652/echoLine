import { useState, useRef, useEffect } from 'react';
import { FiSend, FiImage, FiSettings, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import GroupMessage from './GroupMessage';
import GroupSettingsModal from './GroupSettingsModal';
import { uploadImage } from '../lib/uploadImage';

const GroupChat = ({ onBack }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { selectedGroup, groupMessages, sendGroupMessage, isMessagesLoading } = useGroup();
  const { authUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupMessages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !imagePreview) return;

    try {
      let imageUrl = undefined;
      if (imagePreview) {
        imageUrl = await uploadImage(imagePreview);
        if (!imageUrl) throw new Error("Image upload failed");
      }

      await sendGroupMessage({
        text: text.trim(),
        image: imageUrl
      });
      
      setText('');
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!selectedGroup) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-base-100 overflow-hidden">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="btn btn-sm btn-circle btn-ghost lg:hidden"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                {selectedGroup.groupPicture ? (
                  <img
                    src={selectedGroup.groupPicture}
                    alt={selectedGroup.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{selectedGroup.name}</h3>
                <p className="text-xs text-base-content/50">
                  {selectedGroup.members?.length || 0} members • {selectedGroup.description}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-sm btn-circle btn-ghost"
            title="Group settings"
          >
            <FiSettings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isMessagesLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : groupMessages.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {groupMessages.map((message) => (
              <GroupMessage
                key={message._id}
                message={message}
                authUser={authUser}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-base-300 p-4">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-xs rounded-lg"
            />
            <button
              onClick={() => {
                setImagePreview('');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-circle btn-ghost"
            title="Send image"
          >
            <FiImage className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="textarea textarea-bordered w-full resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="btn btn-circle btn-primary"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Settings Modal */}
      <GroupSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        group={selectedGroup}
      />
    </div>
  );
};

export default GroupChat;

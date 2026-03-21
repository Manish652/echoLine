import { formatDistanceToNow } from 'date-fns';
import { FiUser } from 'react-icons/fi';

const GroupMessage = ({ message, authUser }) => {
  const isOwn = message.senderId._id === authUser._id;
  const isSystem = message.messageType === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-base-300 text-base-content/70 text-xs px-3 py-1 rounded-full">
          {message.systemMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[70%]`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0">
            {message.senderId.profilepic ? (
              <img
                src={message.senderId.profilepic}
                alt={message.senderId.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <FiUser className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Name (for group messages) */}
          {!isOwn && (
            <span className="text-xs text-base-content/50 mb-1 px-1">
              {message.senderId.fullName}
            </span>
          )}

          {/* Message Bubble */}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-primary text-primary-content rounded-br-sm'
                : 'bg-base-200 text-base-content rounded-bl-sm'
            }`}
          >
            {/* Text Message */}
            {message.text && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.text}
              </p>
            )}

            {/* Image Message */}
            {message.image && (
              <div className="mt-1">
                <img
                  src={message.image}
                  alt="Shared image"
                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.image, '_blank')}
                />
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-xs text-base-content/50 mt-1 px-1">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroupMessage;

import { FiUsers, FiPlus, FiSettings } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';

const GroupSidebar = ({ onSelectGroup, selectedGroupId }) => {
  const { groups, isGroupsLoading } = useGroup();
  const { authUser } = useAuth();

  if (isGroupsLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FiUsers className="w-4 h-4" />
            Groups
          </h3>
          <div className="loading loading-spinner loading-sm"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-12 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FiUsers className="w-4 h-4" />
            Groups
          </h3>
        </div>
        <div className="text-center py-8 text-base-content/50">
          <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No groups yet</p>
          <p className="text-xs mt-1">Create your first group to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FiUsers className="w-4 h-4" />
          Groups ({groups.length})
        </h3>
      </div>

      <div className="space-y-1">
        {groups.map((group) => {
          const isSelected = group._id === selectedGroupId;
          const isAdmin = group.admin._id === authUser._id;
          const lastMessageTime = group.lastMessage?.createdAt 
            ? formatDistanceToNow(new Date(group.lastMessage.createdAt), { addSuffix: true })
            : formatDistanceToNow(new Date(group.updatedAt), { addSuffix: true });

          return (
            <div
              key={group._id}
              onClick={() => onSelectGroup(group)}
              className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${isSelected 
                  ? 'bg-primary text-primary-content' 
                  : 'hover:bg-base-200'
                }
              `}
            >
              {/* Group Avatar */}
              <div className="relative flex-shrink-0">
                {group.groupPicture ? (
                  <img
                    src={group.groupPicture}
                    alt={group.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-primary" />
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <FiSettings className="w-2 h-2 text-primary-content" />
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {group.name}
                  </h4>
                  <span className={`text-xs ${isSelected ? 'text-primary-content/70' : 'text-base-content/50'}`}>
                    {lastMessageTime}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm truncate ${isSelected ? 'text-primary-content/80' : 'text-base-content/60'}`}>
                    {group.description || 'No description'}
                  </p>
                  <span className={`text-xs ${isSelected ? 'text-primary-content/70' : 'text-base-content/50'}`}>
                    {group.members?.length || 0} members
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupSidebar;

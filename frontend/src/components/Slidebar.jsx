import { Filter, MessageSquare, Search, UserRound, Users, Plus, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useGroup } from "../context/GroupContext";
import { getImageUrl } from "../lib/imageUtils";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Input } from "./ui/input";
import CreateGroupModal from "./CreateGroupModal";
import GroupSidebar from "./GroupSidebar";

const Sidebar = ({ isMobile, showBackButton, onBack }) => {
  const { getUsers, users, selectedUser, selectUser, isUsersLoading } = useChat();
  const { onlineUsers } = useAuth();
  const { getGroups, selectedGroup, selectGroup, isGroupsLoading } = useGroup();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "groups"

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnlineFilter = !showOnlineOnly || onlineUsers.includes(user._id);
    return matchesSearch && matchesOnlineFilter;
  });

  const handleUserSelect = (user) => {
    selectUser(user);
    selectGroup(null); // Clear group selection
  };

  const handleGroupSelect = (group) => {
    selectGroup(group);
    selectUser(null); // Clear user selection
  };

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className={`h-full ${selectedUser || selectedGroup ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-base-100 flex-col border-r border-base-300`}>
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          {/* Mobile Back Button */}
          {isMobile && showBackButton && (
            <button
              onClick={onBack}
              className="btn btn-sm btn-circle btn-ghost mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-bold text-lg">Messages</h2>
                <p className="text-xs text-base-content/60">{onlineUsers.length} online</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="btn btn-sm btn-circle btn-primary"
              title="Create group"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "chats"
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content hover:bg-base-300"
                }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "groups"
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content hover:bg-base-300"
                }`}
            >
              Groups
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter - Only show for chats tab */}
          {activeTab === "chats" && (
            <button
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`btn btn-sm ${showOnlineOnly ? 'btn-primary' : 'btn-ghost'} w-full`}
            >
              <Filter className="w-4 h-4" />
              {showOnlineOnly ? `Online (${onlineUsers.length})` : 'Show All'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats" ? (
            /* User List */
            filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-200 transition-colors ${selectedUser?._id === user._id ? 'bg-base-200' : ''
                    }`}
                >
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full">
                        <img
                          src={getImageUrl(user.profilepic) || "/avatar.png"}
                          alt={user.fullName}
                          onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${user.fullName}`}
                        />
                      </div>
                    </div>
                    {onlineUsers.includes(user._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-medium truncate">{user.fullName}</h3>
                    <p className="text-sm text-base-content/60">
                      {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <UserRound className="w-16 h-16 text-base-content/20 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No conversations</h3>
                <p className="text-sm text-base-content/60">
                  {showOnlineOnly ? 'No online users found' : 'Start chatting with someone'}
                </p>
              </div>
            )
          ) : (
            /* Groups */
            <GroupSidebar onSelectGroup={handleGroupSelect} selectedGroupId={selectedGroup?._id} />
          )}
        </div>
      </aside>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
    </>
  );
};

export default Sidebar;

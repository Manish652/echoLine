import { useEffect, useState } from 'react';
import ChartCotainer from '../components/ChartCotainer.jsx';
import GroupChat from '../components/GroupChat.jsx';
import NoChartSelected from '../components/NoChartSelected.jsx';
import Slidebar from '../components/Slidebar.jsx';
import { useChat } from '../context/ChatContext';
import { useGroup } from '../context/GroupContext';

function HomePage() {
  const { selectedUser, selectUser } = useChat();
  const { selectedGroup, selectGroup } = useGroup();
  const [isMobile, setIsMobile] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);

  // Clear selected user and group when component mounts
  useEffect(() => {
    selectUser(null);
    selectGroup(null);
  }, [selectUser, selectGroup]);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle back navigation
  const handleBack = () => {
    if (selectedUser) {
      selectUser(null);
    } else if (selectedGroup) {
      selectGroup(null);
    }
    setShowBackButton(false);
  };

  // Show/hide back button based on selection
  useEffect(() => {
    setShowBackButton(!!(selectedUser || selectedGroup));
  }, [selectedUser, selectedGroup]);

  return (
    <div className='h-[calc(100vh-4rem)] mt-16'>
      <div className='h-full bg-base-100'>
        <div className='flex h-full'>
          <Slidebar
            isMobile={isMobile}
            showBackButton={showBackButton}
            onBack={handleBack}
          />

          {/* Desktop: Show content when something is selected */}
          {!isMobile && (
            <>
              {!selectedUser && !selectedGroup && <NoChartSelected />}
              {selectedUser && <ChartCotainer />}
              {selectedGroup && <GroupChat onBack={handleBack} />}
            </>
          )}

          {/* Mobile: Show content when something is selected, hide sidebar */}
          {isMobile && (selectedUser || selectedGroup) && (
            <>
              {selectedUser && <ChartCotainer />}
              {selectedGroup && <GroupChat onBack={handleBack} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage

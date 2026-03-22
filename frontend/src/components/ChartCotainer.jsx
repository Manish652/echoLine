import { format, isSameDay, isValid } from 'date-fns'
import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from "../context/ChatContext"
import { getImageUrl } from '../lib/imageUtils'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import NoChartSelected from './NoChartSelected'
import MessageSkeleton from './skeletons/MessageSkeleton'

function ChartCotainer() {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChat()
  const { authUser } = useAuth()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);
      if (!isValid(date)) return '';
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);
      if (!isValid(date)) return '';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const isMessageFromAuthUser = message => {
    if (!message?.senderId || !authUser?._id) return false;
    return message.senderId._id === authUser._id;
  };

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-hidden bg-base-100'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    )
  }

  if (!selectedUser) {
    return <NoChartSelected />;
  }

  return (
    <div className='flex-1 flex flex-col overflow-hidden bg-base-100'>
      <ChatHeader />

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className='flex-1 overflow-y-auto p-4 space-y-4'
      >
        {messages?.map((message, index) => {
          if (!message) return null;

          const isFirstMessage = index === 0 ||
            !isSameDay(
              new Date(messages[index - 1]?.createdAt || new Date()),
              new Date(message?.createdAt || new Date())
            );

          return (
            <React.Fragment key={message._id || index}>
              {/* Date Separator */}
              {isFirstMessage && (
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 text-xs text-base-content/50 bg-base-200 rounded-full">
                    {formatDate(message?.createdAt)}
                  </div>
                </div>
              )}

              {/* Message */}
              <div
                className={`flex ${isMessageFromAuthUser(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[70%] space-y-1">
                  {/* Message Content */}
                  <div className={`
                    rounded-2xl px-4 py-3 shadow-md
                    ${isMessageFromAuthUser(message)
                      ? 'bg-gradient-to-r from-primary to-primary text-primary-content rounded-br-none'
                      : 'bg-base-300/80 rounded-bl-none border border-base-300'
                    }
                  `}>
                    {message.text && (
                      <p className="text-sm break-words">
                        {message.text}
                      </p>
                    )}
                    {message.image && (
                      <div className="mt-2">
                        <img
                          src={getImageUrl(message.image)}
                          alt="Message attachment"
                          className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setFullscreenImage(getImageUrl(message.image))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <div className={`text-xs text-base-content/50 ${isMessageFromAuthUser(message) ? 'text-right' : 'text-left'}`}>
                    {formatTime(message?.createdAt)}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Fullscreen Image View */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <MessageInput />
    </div>
  );
}

export default ChartCotainer;

import EmojiPicker from 'emoji-picker-react';
import { Paperclip, Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useChat } from "../context/ChatContext";
import { Input } from "./ui/input";
import { uploadImage } from "../lib/uploadImage";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const { sendMessage } = useChat();

  // Fixed emoji groups for quick selection
  const quickEmojis = [
    { emoji: "😊", name: "smile" },
    { emoji: "👍", name: "thumbs up" },
    { emoji: "❤️", name: "heart" },
    { emoji: "😂", name: "joy" },
    { emoji: "🎉", name: "party" },
    { emoji: "👋", name: "wave" },
    { emoji: "🔥", name: "fire" },
    { emoji: "✅", name: "check" }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (2MB limit for faster uploads)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Compress image before setting preview
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if too large
        const maxDimension = 1000;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(compressedImage);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onEmojiClick = (emojiData) => {
    insertEmoji(emojiData.emoji);
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

      const messageData = {
        text: text.trim(),
        image: imageUrl,
      };

      if (onSendMessage) {
        // For AI chat
        await onSendMessage(messageData);
      } else {
        // For regular chat
        await sendMessage(messageData);
      }

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target) &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="border-t border-base-300 p-4 relative">
      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mb-4 max-w-[200px]">
          <img
            src={imagePreview}
            alt="Preview"
            className="rounded-lg w-full h-auto border border-base-300"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 p-1 bg-error text-error-content rounded-full hover:bg-error/90 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Quick Emoji Bar */}
      <div className="flex mb-3 gap-2">
        {quickEmojis.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => insertEmoji(item.emoji)}
            className="text-xl p-2 rounded-full hover:bg-base-200 transition-colors"
            title={item.name}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="pr-12 bg-base-200/50 border-transparent focus:border-primary shadow-sm rounded-full"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-lg hover:bg-base-200 transition-colors"
            >
              <Smile className={`size-5 ${showEmojiPicker ? "text-primary" : "text-base-content/70"}`} />
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-base-200 transition-colors"
        >
          <Paperclip className="size-5 text-base-content/70" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className={`p-2 rounded-lg ${text.trim() || imagePreview
            ? "bg-primary text-primary-content hover:bg-primary/90"
            : "bg-base-200 text-base-content/50"
            } transition-colors`}
        >
          <Send className="size-5" />
        </button>
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-20 right-4 z-50 bg-base-100 rounded-lg shadow-xl border border-base-300"
          style={{ maxWidth: "320px" }}
        >
          <div className="p-2 flex justify-between items-center border-b border-base-300">
            <span className="font-medium">Emojis</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="p-1 rounded-md hover:bg-base-200"
            >
              <X className="size-4" />
            </button>
          </div>

          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={320}
            height={350}
            searchPlaceholder="Search emoji..."
            previewConfig={{
              showPreview: false
            }}
            skinTonesDisabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default MessageInput;

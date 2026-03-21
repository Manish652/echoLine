export const uploadImage = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  // Optional: add loading toast or state if needed, but error handling is done in components
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) throw new Error('Failed to upload image');
    
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

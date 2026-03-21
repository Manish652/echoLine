// Helper function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local path, prepend the API base URL
  const baseURL = import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "";

  return `${baseURL}${imagePath}`;
};

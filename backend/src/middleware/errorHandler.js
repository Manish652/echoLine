// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Global error:', err);

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File size too large' });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: err.stack
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

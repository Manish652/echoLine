// Health check endpoint
export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Chat app server is running",
    timestamp: new Date().toISOString()
  });
};

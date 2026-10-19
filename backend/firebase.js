// Notification Service Stub
// Push notifications are handled in real-time via persistent WebSockets (Socket.IO).
// External Firebase credentials and IDs have been decoupled for security and self-contained Docker deployment.

export const messaging = {
  send: async (payload) => {
    return { success: true, message: "Real-time delivery handled via WebSockets" };
  },
};

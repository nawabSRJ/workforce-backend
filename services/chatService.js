import { Server } from "socket.io";
import Message from "../models/messageModel.js";

/**
 * Initializes Socket.IO with chat event handlers.
 * @param {http.Server} server - The HTTP server instance.
 */
export const initChatService = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://workforce-frontend.vercel.app", "http://localhost:5173"],
      methods: ["GET", "POST"]
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    let currentUserId = null;

    socket.on("joinUser", (userId) => {
      if (currentUserId) {
        socket.leave(currentUserId);
      }
      currentUserId = userId;
      socket.join(userId);
      console.log(`User ${userId} joined room (socket ${socket.id})`);
      socket.emit("joinedRoom", { success: true, userId });
    });

    socket.on("sendMessage", async (messageData, callback) => {
      console.log("Received message via socket:", messageData);

      try {
        const { senderId, receiverId, senderModel, receiverModel, message } = messageData;

        if (!senderId || !receiverId || !senderModel || !receiverModel || !message) {
          throw new Error("Missing required message fields");
        }

        const newMessage = new Message({
          senderId,
          receiverId,
          senderModel,
          receiverModel,
          message,
          timestamp: new Date()
        });

        const savedMessage = await newMessage.save();
        console.log("Saved message to DB:", savedMessage);

        io.to(senderId).emit("receiveMessage", savedMessage);
        io.to(receiverId).emit("receiveMessage", savedMessage);

        console.log(`Message broadcasted to ${senderId} and ${receiverId}`);

        if (callback) {
          callback({ success: true, message: savedMessage });
        }
      } catch (error) {
        console.error("Error processing socket message:", error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`User ${currentUserId || 'unknown'} disconnected (socket ${socket.id}): ${reason}`);
      if (currentUserId) {
        socket.leave(currentUserId);
      }
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${currentUserId}:`, error);
    });
  });
};

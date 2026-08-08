import { io } from "socket.io-client";

const socket = io("https://connecthub-backend-1kue.onrender.com", {
  transports: ["websocket", "polling"], // 👈 IMPORTANT
  withCredentials: true,                // 👈 IMPORTANT
});

export default socket;
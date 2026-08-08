import { io } from "socket.io-client";

const socket = io("https://connecthub-backend-1kue.onrender.com");

export default socket;
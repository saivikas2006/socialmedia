import axios from "axios";

const api = axios.create({
  baseURL: "https://connecthub-backend-1kue.onrender.com/api",
});

export default api;
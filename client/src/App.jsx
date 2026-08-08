import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Search from "./pages/Search";
import EditProfile from "./pages/EditProfile";
import Discover from "./pages/Discover";
import Notifications from "./pages/Notifications";
import PostDetails from "./pages/PostDetails";
import Chat from "./pages/Chat";
import ChatRoom from "./pages/ChatRoom";

function App() {
  return (
   <BrowserRouter>
  <Routes>

    <Route path="/" element={<Home />} />

    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/search" element={<Search />} />

    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/:id" element={<UserProfile />} />

    <Route path="/edit-profile" element={<EditProfile />} />

    <Route path="/discover" element={<Discover />} />

    <Route path="/notifications" element={<Notifications />} />

    <Route path="/posts/:id" element={<PostDetails />} />

    <Route path="/chat" element={<Chat />} />
    <Route path="/chat/:id" element={<ChatRoom />} />

  </Routes>
</BrowserRouter>
  );
}

export default App;
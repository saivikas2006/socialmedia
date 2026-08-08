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

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Search */}
        <Route path="/search" element={<Search />} />

        {/* My Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Other User Profile */}
        <Route path="/users/:id" element={<UserProfile />} />

        {/* Edit Profile */}
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Discover */}
        <Route path="/discover" element={<Discover />} />

        {/* Notifications */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Post Details */}
        <Route path="/posts/:id" element={<PostDetails />} />
        {/* Chat */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<ChatRoom />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
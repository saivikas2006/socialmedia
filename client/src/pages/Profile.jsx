import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
    fetchMyPosts();
    fetchUsers();
  }, []);

  // ✅ IMAGE FIX
  const getImage = (img) => {
    if (!img || img === "undefined") return "";
    if (img.startsWith("http")) return img;
    return `https://connecthub-backend-1kue.onrender.com${img}`;
  };

  // ================= PROFILE =================
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user || null);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  // ================= POSTS =================
  const fetchMyPosts = async () => {
    try {
      const res = await api.get("/posts/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // ================= USERS =================
  const fetchUsers = async () => {
    try {
      const currentUser =
        JSON.parse(localStorage.getItem("user")) || {};

      const res = await api.get("/users/search?keyword=", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const suggestions = (res.data.users || []).filter(
        (person) =>
          person &&
          person._id !== currentUser?._id &&
          !(currentUser?.following || []).includes(person._id)
      );

      setUsers(suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FOLLOW =================
  const followUser = async (id) => {
    try {
      await api.put(
        `/users/follow/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("User followed");
      fetchUsers();
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  // ================= DELETE =================
  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Post deleted");

      setPosts((prev) =>
        prev.filter((post) => post && post._id !== id)
      );
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ================= LOADING =================
  if (loading || !user) {
    return (
      <div className="text-white text-center mt-20">
        Loading Profile...
      </div>
    );
  }

  // ================= UI =================
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6">

    <div className="max-w-5xl mx-auto space-y-10">

      {/* 🔥 PROFILE CARD */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl">

        <div className="flex flex-col md:flex-row items-center gap-8">

          {getImage(user.profilePic) ? (
            <img
              src={getImage(user.profilePic)}
              className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/40"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          )}

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>

            <p className="text-gray-500 text-sm mt-1">
              {user.bio || "No bio added yet."}
            </p>

            <div className="flex justify-center md:justify-start gap-8 mt-4 text-sm">
              <span><b>{posts.length}</b> Posts</span>
              <span><b>{user.followers?.length || 0}</b> Followers</span>
              <span><b>{user.following?.length || 0}</b> Following</span>
            </div>

            <button
              onClick={() => navigate("/edit-profile")}
              className="mt-5 px-6 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg"
            >
              Edit Profile
            </button>
          </div>

        </div>
      </div>

      {/* 🔥 POSTS */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Posts</h2>

        {posts.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
            You haven't created any posts yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:scale-105 transition"
              >
                {getImage(post.image) && (
                  <img
                    src={getImage(post.image)}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4">
                  <p className="text-sm text-gray-300">
                    {post.caption}
                  </p>

                  <div className="flex justify-between mt-3 text-sm">
                    <span>❤️ {post.likes?.length || 0}</span>

                    <button onClick={() => deletePost(post._id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 DISCOVER */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Discover People
        </h2>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">

          {users.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No suggestions available
            </p>
          ) : (
            users.map((person) => (
              <div
                key={person._id}
                className="flex items-center justify-between hover:bg-white/5 p-3 rounded-lg transition"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/users/${person._id}`)}
                >
                  {getImage(person.profilePic) ? (
                    <img
                      src={getImage(person.profilePic)}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      {person.name?.charAt(0)}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium">
                      {person.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {person.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => followUser(person._id)}
                  className="text-xs px-4 py-1 bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Follow
                </button>
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  </div>
);
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Trash2, Edit } from "lucide-react";
import Navbar from "../components/Navbar";

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

  // ✅ UNIVERSAL IMAGE FIX
  const getImage = (img) => {
    if (!img) return "";
    return img.startsWith("http")
      ? img
      : `https://connecthub-backend-1kue.onrender.com${img}`;
  };

  // ================= PROFILE =================
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  // ================= MY POSTS =================
  const fetchMyPosts = async () => {
    try {
      const res = await api.get("/posts/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(res.data.posts);
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
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const res = await api.get("/users/search?keyword=", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const suggestions = res.data.users.filter(
        (person) =>
          person._id !== currentUser._id &&
          !currentUser.following.includes(person._id)
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Post deleted");
      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white text-2xl">
        Loading Profile...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-5xl mx-auto">

          {/* PROFILE CARD */}
          <div className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* ✅ PROFILE IMAGE FIXED */}
              {user.profilePic ? (
                <img
                  src={getImage(user.profilePic)}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-400 mt-2">{user.email}</p>
                <p className="text-gray-300 mt-3">
                  {user.bio || "No bio added yet."}
                </p>

                <div className="flex gap-10 mt-6">
                  <div>
                    <h2 className="text-2xl font-bold">{posts.length}</h2>
                    <p className="text-gray-400">Posts</p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.followers.length}
                    </h2>
                    <p className="text-gray-400">Followers</p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.following.length}
                    </h2>
                    <p className="text-gray-400">Following</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/edit-profile")}
                  className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* POSTS */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">My Posts</h2>

            {posts.length === 0 ? (
              <div className="bg-slate-900 rounded-xl p-10 text-center text-gray-400">
                You haven't created any posts yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg"
                  >
                    {/* ✅ POST IMAGE FIXED */}
                    {post.image && (
                      <img
                        src={getImage(post.image)}
                        alt="Post"
                        className="w-full h-60 object-cover"
                      />
                    )}

                    <div className="p-4">
                      <p className="text-gray-200">{post.caption}</p>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          ❤️ {post.likes.length} Likes
                        </span>

                        <button
                          onClick={() => deletePost(post._id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DISCOVER PEOPLE */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🌎 Discover People</h2>

              <button
                onClick={() => navigate("/search")}
                className="text-blue-500 hover:text-blue-400 transition"
              >
                View All →
              </button>
            </div>

            {users.length === 0 ? (
              <div className="bg-slate-900 rounded-xl p-8 text-center text-gray-400">
                No users to discover.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.slice(0, 6).map((person) => (
                  <div
                    key={person._id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500 transition"
                  >
                    <div className="flex items-center gap-4">

                      {/* ✅ DISCOVER IMAGE FIXED */}
                      {person.profilePic ? (
                        <img
                          src={getImage(person.profilePic)}
                          alt={person.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{person.name}</h3>
                        <p className="text-sm text-gray-400 truncate">
                          {person.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => navigate(`/profile/${person._id}`)}
                        className="flex-1 border border-slate-700 py-2 rounded-lg hover:bg-slate-800"
                      >
                        View
                      </button>

                      <button
                        onClick={() => followUser(person._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
                      >
                        Follow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
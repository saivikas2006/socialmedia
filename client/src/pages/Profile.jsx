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

  // ✅ IMAGE FIX
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      // ✅ remove safely
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

          {/* PROFILE */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {user?.profilePic ? (
                <img
                  src={getImage(user.profilePic)}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-4xl">
                  {user?.name?.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold">
                  {user?.name}
                </h1>

                <p className="text-gray-400">
                  {user?.email}
                </p>

                <div className="flex gap-6 mt-4">
                  <span>{posts.length} Posts</span>
                  <span>
                    {user?.followers?.length || 0} Followers
                  </span>
                  <span>
                    {user?.following?.length || 0} Following
                  </span>
                </div>

                <button
                  onClick={() => navigate("/edit-profile")}
                  className="mt-4 bg-blue-600 px-4 py-2 rounded"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* POSTS */}
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts
              .filter((post) => post) // ✅ FIX
              .map((post) => (
                <div key={post._id} className="bg-slate-900 rounded-xl">

                  {post.image && (
                    <img
                      src={getImage(post.image)}
                      className="w-full h-60 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <p>{post.caption}</p>

                    <div className="flex justify-between mt-3">
                      <span>
                        ❤️ {post?.likes?.length || 0}
                      </span>

                      <button
                        onClick={() => deletePost(post._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </div>
    </>
  );
}
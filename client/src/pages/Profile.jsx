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

  // ================= IMAGE FIX =================
  const getImage = (img) => {
    if (!img || img === "undefined") return "";

    if (img.startsWith("http")) return img;

    return `https://connecthub-backend-1kue.onrender.com${img}`;
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
    return <p className="text-white p-10">Loading Profile...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* ================= PROFILE ================= */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* PROFILE IMAGE FIX */}
            {user?.profilePic && user.profilePic !== "undefined" ? (
              <img
                src={getImage(user.profilePic)}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-4xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
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
                className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ================= POSTS ================= */}
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts
            .filter((post) => post)
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

        {/* ================= DISCOVER PEOPLE ================= */}
        <div className="mt-14">
          <h2 className="text-2xl font-semibold mb-6">
            Discover People
          </h2>

          {users.length === 0 ? (
            <p className="text-gray-400">
              No suggestions available
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((person) => (
                <div
                  key={person._id}
                  className="bg-slate-900 p-5 rounded-xl flex items-center justify-between border border-slate-800"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() =>
                      navigate(`/users/${person._id}`)
                    }
                  >
                    {person.profilePic ? (
                      <img
                        src={getImage(person.profilePic)}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                        {person.name?.charAt(0)}
                      </div>
                    )}

                    <div>
                      <p className="font-medium">
                        {person.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {person.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => followUser(person._id)}
                    className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
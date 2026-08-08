import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, [id]);

  // ✅ FIX: Universal Image Handler
  const getImage = (img) => {
    if (!img) return "";
    return img.startsWith("http")
      ? img
      : `https://connecthub-backend-1kue.onrender.com${img}`;
  };

  // ================= Fetch User =================
  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileUser = res.data.user;

      setUser(profileUser);

      setIsFollowing(
        profileUser.followers.includes(currentUser?._id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ================= Fetch Posts =================
  const fetchPosts = async () => {
    try {
      const res = await api.get(`/posts/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(res.data.posts);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= Follow =================
  const followUser = async () => {
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

      toast.success(
        isFollowing ? "User unfollowed" : "User followed"
      );

      fetchUser();
    } catch (err) {
      console.log(err);
      toast.error("Operation failed");
    }
  };

  // ================= Start Chat =================
  const startChat = async () => {
    try {
      const res = await api.post(
        "/conversations",
        { receiverId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/chat/${res.data.conversation._id}`);
    } catch (err) {
      console.log(err);
      toast.error("Failed to start chat");
    }
  };

  if (!user) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto py-10">

        {/* Profile Card */}
        <div className="bg-slate-900 rounded-2xl p-8">
          <div className="flex items-center gap-8">

            {/* ✅ PROFILE PIC FIXED */}
            {user.profilePic ? (
              <img
                src={getImage(user.profilePic)}
                alt=""
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">
                {user.name}
              </h1>

              <p className="text-gray-400">
                {user.email}
              </p>

              <p className="mt-2 text-gray-300">
                {user.bio || "No bio yet."}
              </p>

              <div className="flex gap-8 mt-5">
                <div>
                  <h2 className="text-xl font-bold">
                    {posts.length}
                  </h2>
                  <p className="text-gray-400">Posts</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {user.followers.length}
                  </h2>
                  <p className="text-gray-400">Followers</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {user.following.length}
                  </h2>
                  <p className="text-gray-400">Following</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={followUser}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    isFollowing
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>

                <button
                  onClick={startChat}
                  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition"
                >
                  Message
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* POSTS */}
        <h2 className="text-2xl font-bold mt-10 mb-5">
          Posts
        </h2>

        {posts.length === 0 ? (
          <div className="bg-slate-900 rounded-xl p-10 text-center text-gray-400">
            No posts yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800"
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
                  <p>{post.caption}</p>

                  <div className="mt-3 text-gray-300">
                    ❤️ {post.likes.length} Likes
                  </div>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}
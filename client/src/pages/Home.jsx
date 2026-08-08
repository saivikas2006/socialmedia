import { useEffect, useState } from "react";
import { FaImage } from "react-icons/fa";
import api from "../services/api";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import BottomBar from "../components/BottomBar";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");

      // ✅ IMPORTANT FIX
      const safePosts = (res.data.posts || []).filter(
        (p) => p && p._id
      );

      setPosts(safePosts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white">
        {/* Create Post Modal */}
        <CreatePost
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          refreshPosts={fetchPosts}
        />

        {/* Feed */}
        <div className="max-w-3xl mx-auto py-8 px-4 pb-28">

          {/* Create Post */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg">
            <button
              onClick={() => setOpenModal(true)}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-lg font-semibold"
            >
              ➕ Create New Post
            </button>
          </div>

          {/* ✅ LOADING */}
          {loading ? (
            <div className="text-center text-gray-400">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl p-10 text-center border border-slate-800 shadow-lg">
              <FaImage className="mx-auto text-6xl text-gray-500 mb-5" />

              <h2 className="text-2xl font-bold">
                No Posts Yet
              </h2>

              <p className="text-gray-400 mt-3">
                Share your first post with ConnectHub 🚀
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                refreshPosts={fetchPosts}
              />
            ))
          )}
        </div>

        <BottomBar onCreatePost={() => setOpenModal(true)} />
      </div>
    </>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentDots,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../services/api";
import CommentsModal from "./CommentsModal";

export default function PostCard({ post, refreshPosts }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [openComments, setOpenComments] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const isLiked = post.likes.some(
    (id) => id.toString() === user?._id
  );

  const handleLike = async (e) => {
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);

      await api.put(
        `/posts/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      refreshPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to like post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg mb-8">

        {/* User */}
        <div
          onClick={() => navigate(`/users/${post.user._id}`)}
          className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-800 transition"
        >
          {post.user.profilePic ? (
            <img
              src={`https://connecthub-backend-1kue.onrender.com${post.user.profilePic}`}
              alt={post.user.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
              {post.user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="font-semibold text-lg">
              {post.user.name}
            </h2>

            <p className="text-sm text-gray-400">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Caption */}
        <div
          onClick={() => navigate(`/posts/${post._id}`)}
          className="px-5 pb-5 cursor-pointer"
        >
          <p className="text-gray-200 text-lg hover:text-white transition">
            {post.caption}
          </p>
        </div>

        {/* Image */}
       {post.image && (
  <img
    onClick={() => navigate(`/posts/${post._id}`)}
    src={post.image}
    alt="Post"
    className="w-full object-cover max-h-[550px] cursor-pointer hover:opacity-95 transition"
  />
)}

        {/* Footer */}
        <div className="flex justify-between items-center px-5 py-4 border-t border-slate-800">

          {/* Like */}
          <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-2 transition disabled:opacity-50 ${
              isLiked
                ? "text-red-500"
                : "text-gray-400 hover:text-red-500"
            }`}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}

            <span>{post.likes.length} Likes</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => navigate(`/posts/${post._id}`)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <FaRegCommentDots />

            <span>
              {post.comments?.length || 0} Comments
            </span>
          </button>

        </div>

      </div>

      {/* Comments Modal (optional) */}
      <CommentsModal
        postId={post._id}
        isOpen={openComments}
        onClose={() => setOpenComments(false)}
      />
    </>
  );
}
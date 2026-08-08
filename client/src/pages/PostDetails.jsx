import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Heart,
  MessageCircle,
  ArrowLeft,
  Send,
} from "lucide-react";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchPost();
  }, [id]);

  // ================= Fetch Post =================

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);

      setPost(res.data.post);
    } catch (err) {
      console.log(err);
      toast.error("Post not found");
    } finally {
      setLoading(false);
    }
  };

  // ================= Like =================

  const likePost = async () => {
    try {
      await api.put(
        `/posts/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPost();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= Add Comment =================

  const addComment = async () => {
    if (!comment.trim()) return;

    try {
      await api.post(
        `/comments/${id}`,
        {
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComment("");

      fetchPost();

      toast.success("Comment added");
    } catch (err) {
      console.log(err);
      toast.error("Failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white text-2xl">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white text-2xl">
        Post not found
      </div>
    );
  }

  const liked =
    post.likes?.includes(user?._id) ||
    false;
      return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white pb-24">
        <div className="max-w-5xl mx-auto p-6">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">

            {/* Image */}
            {post.image && (
              <img
                src={`http://localhost:5000${post.image}`}
                alt="Post"
                className="w-full max-h-[500px] object-cover"
              />
            )}

            <div className="p-6">

              {/* User */}
              <div className="flex items-center gap-4 mb-5">

                {post.user?.profilePic ? (
                  <img
                    src={`http://localhost:5000${post.user.profilePic}`}
                    alt={post.user.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                    {post.user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="font-bold text-xl">
                    {post.user?.name}
                  </h2>

                  <p className="text-gray-400 text-sm">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>

              </div>

              {/* Caption */}
              <p className="text-lg mb-6">
                {post.caption}
              </p>

              {/* Like */}
              <div className="flex items-center gap-6 mb-8">

                <button
                  onClick={likePost}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-lg transition"
                >
                  <Heart
                    size={22}
                    className={
                      liked
                        ? "fill-red-500 text-red-500"
                        : "text-red-500"
                    }
                  />

                  {post.likes.length}
                </button>

                <div className="flex items-center gap-2 text-gray-300">
                  <MessageCircle size={22} />
                  {post.comments.length}
                </div>

              </div>

              {/* Comments */}
              <h3 className="text-xl font-bold mb-4">
                Comments
              </h3>

              {post.comments.length === 0 ? (
                <p className="text-gray-500 mb-6">
                  No comments yet.
                </p>
              ) : (
                <div className="space-y-4 mb-6">

                  {post.comments.map((c) => (
                    <div
                      key={c._id}
                      className="bg-slate-800 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">

                        {c.user?.profilePic ? (
                          <img
                            src={`http://localhost:5000${c.user.profilePic}`}
                            alt={c.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                            {c.user?.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold">
                            {c.user?.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {new Date(
                              c.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>

                      </div>

                      <p className="ml-13">
                        {c.comment}
                      </p>

                    </div>
                  ))}

                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-3">

                <input
                  type="text"
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="Write a comment..."
                  className="flex-1 bg-slate-800 rounded-xl px-4 py-3 outline-none"
                />

                <button
                  onClick={addComment}
                  className="bg-blue-600 hover:bg-blue-700 px-5 rounded-xl flex items-center justify-center"
                >
                  <Send size={20} />
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>

      <BottomBar />
    </>
  );
}
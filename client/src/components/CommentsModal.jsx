import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { X, Send } from "lucide-react";

export default function CommentsModal({
  postId,
  isOpen,
  onClose,
}) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`);
      setComments(res.data.comments);
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;

    try {
      await api.post(
        `/comments/${postId}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setComment("");
      fetchComments();
      toast.success("Comment Added");
    } catch (err) {
      console.log(err);
      toast.error("Failed to add comment");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden border border-slate-700">

        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h2 className="text-xl font-bold">Comments</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="h-80 overflow-y-auto p-5 space-y-4">

          {comments.length === 0 ? (
            <p className="text-gray-400 text-center">
              No comments yet.
            </p>
          ) : (
            comments.map((item) => (
              <div
                key={item._id}
                className="bg-slate-800 rounded-xl p-3"
              >
                <h3 className="font-semibold">
                  {item.user?.name}
                </h3>

                <p className="text-gray-300 mt-1">
                  {item.comment}
                </p>
              </div>
            ))
          )}

        </div>

        <div className="flex gap-3 p-4 border-t border-slate-700">

          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-slate-800 rounded-lg px-4 py-2 outline-none"
          />

          <button
            onClick={addComment}
            className="bg-blue-600 hover:bg-blue-700 px-5 rounded-lg"
          >
            <Send size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}
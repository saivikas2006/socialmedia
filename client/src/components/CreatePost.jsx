import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function CreatePost({
  isOpen,
  onClose,
  refreshPosts,
}) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("image", image);

      await api.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Post Created Successfully");

      setCaption("");
      setImage(null);

      refreshPosts();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 px-4">

      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 p-6">

        <h2 className="text-2xl font-bold text-white mb-6">
          Create New Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <textarea
            rows="4"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none resize-none"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-gray-300"
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Posting..." : "Post"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
import { Link } from "react-router-dom";
import {
  Home,
  Search,
  CirclePlus,
  User,
  MessageCircle,
} from "lucide-react";

export default function BottomBar({ onCreatePost }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">

      <div className="max-w-3xl mx-auto flex items-center justify-around px-4 py-3">

        {/* ================= Home ================= */}
        <Link
          to="/"
          className="flex flex-col items-center text-gray-300 hover:text-blue-500 transition"
        >
          <Home size={22} />
          <span className="text-xs mt-1">
            Home
          </span>
        </Link>

        {/* ================= Chat ================= */}
        <Link
          to="/chat"
          className="flex flex-col items-center text-gray-300 hover:text-blue-500 transition"
        >
          <MessageCircle size={22} />
          <span className="text-xs mt-1">
            Chat
          </span>
        </Link>

        {/* ================= Post ================= */}
        <button
          onClick={onCreatePost}
          className="flex flex-col items-center text-blue-500 hover:text-blue-400 transition"
        >
          <CirclePlus size={30} />
          <span className="text-xs mt-1">
            Post
          </span>
        </button>

        {/* ================= Search ================= */}
        <Link
          to="/search"
          className="flex flex-col items-center text-gray-300 hover:text-blue-500 transition"
        >
          <Search size={22} />
          <span className="text-xs mt-1">
            Search
          </span>
        </Link>

        {/* ================= Profile ================= */}
        <Link
          to="/profile"
          className="flex flex-col items-center text-gray-300 hover:text-blue-500 transition"
        >
          <User size={22} />
          <span className="text-xs mt-1">
            Profile
          </span>
        </Link>

      </div>
    </div>
  );
}
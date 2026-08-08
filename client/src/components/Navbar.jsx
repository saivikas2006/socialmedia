import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Compass,
  Bell,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

// ================= Logo =================
import connectHubLogo from "../assets/logo/ConnectHub.png";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [notificationCount, setNotificationCount] =
    useState(0);

  // ================= Search Users =================
  const searchUsers = async (value) => {
    setKeyword(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await api.get(
        `/users/search?keyword=${encodeURIComponent(value)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= Fetch Notifications =================
  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const res = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const unread =
        res.data.notifications.filter(
          (notification) => !notification.isRead
        ).length;

      setNotificationCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= Load Notifications =================
  useEffect(() => {
    if (!token) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  // ================= Logout =================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* ================= Logo ================= */}
        <Link
          to="/"
          className="flex items-center group"
        >
          <img
            src={connectHubLogo}
            alt="ConnectHub"
            className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* ================= Search ================= */}
        <div className="relative hidden md:block w-[420px]">

          <div className="flex items-center bg-slate-800 rounded-full px-4 py-2">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={keyword}
              onChange={(e) =>
                searchUsers(e.target.value)
              }
              className="ml-3 w-full bg-transparent outline-none text-white placeholder-gray-400"
            />

          </div>

          {/* ================= Search Results ================= */}
          {results.length > 0 && (
            <div className="absolute mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">

              {results.map((person) => (
                <div
                  key={person._id}
                  onClick={() => {
                    setKeyword("");
                    setResults([]);

                    navigate(
                      `/profile/${person._id}`
                    );
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 cursor-pointer transition"
                >

                  {/* Profile Image */}
                  {person.profilePic ? (
                    <img
                      src={`https://connecthub-backend-1kue.onrender.com${person.profilePic}`}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {person.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {/* User Info */}
                  <div>

                    <p className="font-semibold text-white">
                      {person.name}
                    </p>

                    <p className="text-sm text-gray-400">
                      {person.email}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* ================= Right Side ================= */}
        <div className="flex items-center gap-3">

          {/* ================= Discover ================= */}
          <button
            onClick={() =>
              navigate("/discover")
            }
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-gray-300 hover:text-blue-500 transition"
          >
            <Compass size={18} />

            <span className="hidden lg:inline">
              Discover
            </span>
          </button>

          {/* ================= Notifications ================= */}
          <button
            onClick={() =>
              navigate("/notifications")
            }
            className="relative bg-slate-800 hover:bg-slate-700 p-3 rounded-full text-gray-300 hover:text-yellow-400 transition"
          >
            <Bell size={20} />

            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </button>

          {/* ================= Profile ================= */}
          <div
            onClick={() =>
              navigate("/profile")
            }
            className="cursor-pointer"
          >

            {user?.profilePic ? (
              <img
                src={`https://connecthub-backend-1kue.onrender.com${user.profilePic}`}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 hover:scale-110 transition"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>
            )}

          </div>

          {/* ================= Logout ================= */}
          <button
            onClick={logout}
            title="Logout"
            className="bg-slate-800 hover:bg-red-600 p-3 rounded-full text-red-400 hover:text-white transition"
          >
            <LogOut size={20} />
          </button>

        </div>

      </div>

    </nav>
  );
}
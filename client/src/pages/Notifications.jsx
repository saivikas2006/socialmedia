import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trash2,
} from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data.notifications);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load notifications");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put(
        "/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchNotifications();

      toast.success("All notifications marked as read");
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();

    try {
      await api.delete(`/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.filter((n) => n._id !== id)
      );

      toast.success("Notification deleted");
    } catch (err) {
      console.log(err);
    }
  };

  const openNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.put(
          `/notifications/read/${notification._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (
        notification.type === "like" ||
        notification.type === "comment"
      ) {
        navigate(`/posts/${notification.post._id}`);
      } else if (notification.type === "follow") {
        navigate(`/users/${notification.sender._id}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const icon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="text-red-500" size={22} />;

      case "comment":
        return (
          <MessageCircle
            className="text-blue-500"
            size={22}
          />
        );

      case "follow":
        return (
          <UserPlus
            className="text-green-500"
            size={22}
          />
        );

      default:
        return <Bell size={22} />;
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white pb-24">
        <div className="max-w-3xl mx-auto p-6">

          <div className="flex justify-between items-center mb-8">

            <h1 className="text-3xl font-bold">
              Notifications
            </h1>

            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                Mark All Read
              </button>
            )}

          </div>

          {notifications.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">

              <Bell
                size={60}
                className="mx-auto text-gray-500 mb-5"
              />

              <h2 className="text-2xl font-bold">
                No Notifications
              </h2>

              <p className="text-gray-400 mt-3">
                Likes, comments and follows will appear here.
              </p>

            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => openNotification(notification)}
                className={`mb-4 rounded-xl p-5 border cursor-pointer transition-all hover:scale-[1.01] ${
                  notification.isRead
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-800 border-blue-500"
                }`}
              >
                <div className="flex justify-between">

                  <div className="flex gap-4">

                    <div>
                      {icon(notification.type)}
                    </div>

                    <div>

                      <h2 className="font-semibold">
                        {notification.sender?.name}
                      </h2>

                      <p className="text-gray-300">
                        {notification.message}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={(e) =>
                      deleteNotification(
                        e,
                        notification._id
                      )
                    }
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              </div>
            ))
          )}

        </div>
      </div>

      <BottomBar />
    </>
  );
}
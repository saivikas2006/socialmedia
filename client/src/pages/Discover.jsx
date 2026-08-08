import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import toast from "react-hot-toast";

export default function Discover() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/search?keyword=", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const suggestions = res.data.users.filter(
        (user) => user._id !== currentUser._id
      );

      setUsers(suggestions);
    } catch (err) {
      console.log(err);
    }
  };

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

      toast.success("Updated");

      fetchUsers();
    } catch (err) {
      toast.error("Failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white pb-24">

        <div className="max-w-6xl mx-auto p-8">

          <h1 className="text-4xl font-bold mb-8">
            🌎 Discover People
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {users.map((user) => (

              <div
                key={user._id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
              >

                {user.profilePic ? (
                  <img
                    src={`http://localhost:5000${user.profilePic}`}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold mx-auto">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h2 className="text-xl font-bold text-center mt-5">
                  {user.name}
                </h2>

                <p className="text-center text-gray-400">
                  {user.email}
                </p>

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="flex-1 border border-slate-700 py-2 rounded-lg hover:bg-slate-800"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => followUser(user._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
                  >
                    Follow
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      <BottomBar />
    </>
  );
}
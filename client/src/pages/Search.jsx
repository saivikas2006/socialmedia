import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";

export default function Search() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);

  const searchUsers = async (value) => {
    setKeyword(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    try {
      const res = await api.get(
        `/users/search?keyword=${value}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUsers(res.data.users);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white pb-24">

        <div className="max-w-3xl mx-auto p-6">

          {/* Search Box */}
          <div className="flex items-center bg-slate-900 rounded-xl px-5 py-4 border border-slate-800">

            <SearchIcon className="text-gray-400" />

            <input
              type="text"
              placeholder="Search users..."
              value={keyword}
              onChange={(e) => searchUsers(e.target.value)}
              className="ml-4 flex-1 bg-transparent outline-none text-white"
            />

          </div>

          {/* Results */}

          <div className="mt-8">

            {users.length === 0 ? (

              <div className="text-center text-gray-500 mt-20">

                <SearchIcon
                  size={70}
                  className="mx-auto mb-5"
                />

                <h2 className="text-2xl font-bold">
                  Search Users
                </h2>

                <p className="mt-3">
                  Find your friends on ConnectHub
                </p>

              </div>

            ) : (

              users.map((user) => (

                <div
                  key={user._id}
                  onClick={() =>
                    navigate(`/profile/${user._id}`)
                  }
                  className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center gap-4 mb-4 cursor-pointer hover:bg-slate-800 transition"
                >
                  {user.profilePic ? (
                    <img
                      src={`http://localhost:5000${user.profilePic}`}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>

                    <h2 className="font-bold text-lg">
                      {user.name}
                    </h2>

                    <p className="text-gray-400">
                      {user.email}
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

      <BottomBar />
    </>
  );
}
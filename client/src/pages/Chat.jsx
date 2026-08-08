import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Chat() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConversations(res.data.conversations);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load chats");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white pb-24">
        <div className="max-w-3xl mx-auto p-6">

          <h1 className="text-3xl font-bold mb-8">
            Messages
          </h1>

          {conversations.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl p-10 text-center border border-slate-800">
              <h2 className="text-2xl font-bold">
                No Conversations
              </h2>

              <p className="text-gray-400 mt-3">
                Start chatting with someone from their profile.
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.members.find(
                (member) => member._id !== user._id
              );

              return (
                <div
                  key={conversation._id}
                  onClick={() =>
                    navigate(`/chat/${conversation._id}`)
                  }
                  className="bg-slate-900 hover:bg-slate-800 rounded-xl p-5 mb-4 cursor-pointer transition"
                >
                  <div className="flex items-center gap-4">

                    {otherUser?.profilePic ? (
                      <img
                        src={`https://connecthub-backend-1kue.onrender.com${otherUser.profilePic}`}
                        alt={otherUser.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                        {otherUser?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h2 className="font-semibold text-lg">
                        {otherUser?.name}
                      </h2>

                      <p className="text-gray-400">
                        Tap to open chat
                      </p>
                    </div>

                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>

      <BottomBar />
    </>
  );
}
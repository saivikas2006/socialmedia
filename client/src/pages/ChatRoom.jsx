import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Send,
  Check,
  CheckCheck,
} from "lucide-react";
import socket from "../socket";

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const currentUserId = currentUser?._id;

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ==================================================
  // Fetch Conversation + Messages
  // ==================================================

  useEffect(() => {
    fetchConversation();
    fetchMessages();
  }, [id]);

  // ==================================================
  // Register User
  // ==================================================

  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("addUser", currentUserId);
  }, [currentUserId]);

  // ==================================================
  // Online Users
  // ==================================================

  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, []);

  // ==================================================
  // Receive Real-Time Message
  // ==================================================

  useEffect(() => {
    const handleReceiveMessage = async (message) => {
      if (message.conversationId !== id) {
        return;
      }

      // Add incoming message
      setMessages((prev) => {
        const exists = prev.some(
          (existing) =>
            existing._id === message._id
        );

        if (exists) {
          return prev;
        }

        return [...prev, message];
      });

      // ==============================================
      // Mark Message as Delivered
      // ==============================================

      try {
        await api.put(
          `/messages/${message._id}/delivered`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Tell sender that message was delivered
        socket.emit("messageDelivered", {
          messageId: message._id,
          conversationId: id,
          senderId:
            message.sender?._id ||
            message.sender,
        });
      } catch (error) {
        console.error(
          "Delivery update failed:",
          error
        );
      }

      // ==============================================
      // Mark Message as Seen
      // ==============================================

      try {
        await api.put(
          `/messages/${message._id}/seen`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        socket.emit("messageSeen", {
          messageId: message._id,
          conversationId: id,
          senderId:
            message.sender?._id ||
            message.sender,
        });

        // Update local message
        setMessages((prev) =>
          prev.map((item) =>
            item._id === message._id
              ? {
                  ...item,
                  delivered: true,
                  seen: true,
                }
              : item
          )
        );
      } catch (error) {
        console.error(
          "Seen update failed:",
          error
        );
      }
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };
  }, [id, token]);

  // ==================================================
  // Delivered Event
  // ==================================================

  useEffect(() => {
    const handleDelivered = (data) => {
      if (data.conversationId !== id) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          message._id === data.messageId
            ? {
                ...message,
                delivered: true,
              }
            : message
        )
      );
    };

    socket.on(
      "messageDelivered",
      handleDelivered
    );

    return () => {
      socket.off(
        "messageDelivered",
        handleDelivered
      );
    };
  }, [id]);

  // ==================================================
  // Seen Event
  // ==================================================

  useEffect(() => {
    const handleMessageSeen = (data) => {
      if (data.conversationId !== id) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          message._id === data.messageId
            ? {
                ...message,
                delivered: true,
                seen: true,
              }
            : message
        )
      );
    };

    socket.on(
      "messageSeen",
      handleMessageSeen
    );

    return () => {
      socket.off(
        "messageSeen",
        handleMessageSeen
      );
    };
  }, [id]);

  // ==================================================
  // Conversation Seen
  // ==================================================

  useEffect(() => {
    const handleConversationSeen = (data) => {
      if (data.conversationId !== id) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) => ({
          ...message,
          delivered: true,
          seen: true,
        }))
      );
    };

    socket.on(
      "conversationSeen",
      handleConversationSeen
    );

    return () => {
      socket.off(
        "conversationSeen",
        handleConversationSeen
      );
    };
  }, [id]);

  // ==================================================
  // Typing Indicator
  // ==================================================

  useEffect(() => {
    if (!conversation) return;

    const otherUser = conversation.members.find(
      (member) => member._id !== currentUserId
    );

    const otherUserId = otherUser?._id;

    const handleTyping = (senderId) => {
      if (senderId === otherUserId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (senderId) => {
      if (senderId === otherUserId) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on(
      "stopTyping",
      handleStopTyping
    );

    return () => {
      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );
    };
  }, [conversation, currentUserId]);

  // ==================================================
  // Mark Conversation Seen When Opened
  // ==================================================

  useEffect(() => {
    if (!conversation || !currentUserId) {
      return;
    }

    const otherUser = conversation.members.find(
      (member) => member._id !== currentUserId
    );

    const otherUserId = otherUser?._id;

    const markConversationSeen =
      async () => {
        try {
          await api.put(
            `/messages/conversation/${id}/seen`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Tell the other user
          if (otherUserId) {
            socket.emit(
              "conversationSeen",
              {
                conversationId: id,
                senderId: otherUserId,
              }
            );
          }

          // Update local messages
          setMessages((prev) =>
            prev.map((message) => {
              const senderId =
                message.sender?._id ||
                message.sender;

              if (
                senderId?.toString() !==
                currentUserId?.toString()
              ) {
                return {
                  ...message,
                  delivered: true,
                  seen: true,
                };
              }

              return message;
            })
          );
        } catch (error) {
          console.error(
            "Conversation seen error:",
            error
          );
        }
      };

    markConversationSeen();
  }, [
    conversation,
    id,
    currentUserId,
    token,
  ]);

  // ==================================================
  // Auto Scroll
  // ==================================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==================================================
  // Fetch Conversation
  // ==================================================

  const fetchConversation = async () => {
    try {
      const res = await api.get(
        `/conversations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConversation(
        res.data.conversation
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load conversation"
      );
    }
  };

  // ==================================================
  // Fetch Messages
  // ==================================================

  const fetchMessages = async () => {
    try {
      const res = await api.get(
        `/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(res.data.messages);
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load messages"
      );
    }
  };

  // ==================================================
  // Loading
  // ==================================================

  if (!conversation) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">
          Loading Chat...
        </div>

        <BottomBar />
      </>
    );
  }

  // ==================================================
  // Other User
  // ==================================================

  const otherUser =
    conversation.members.find(
      (member) =>
        member._id !== currentUserId
    );

  const otherUserId = otherUser?._id;

  // ==================================================
  // Online Status
  // ==================================================

  const isOnline =
    onlineUsers.some(
      (user) =>
        user.userId === otherUserId
    );

  // ==================================================
  // Send Message
  // ==================================================

  const sendMessage = async () => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    if (!otherUserId) {
      toast.error("User not found");
      return;
    }

    try {
      const res = await api.post(
        "/messages",
        {
          conversationId: id,
          text: trimmedText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newMessage =
        res.data.message;

      // Add to own screen
      setMessages((prev) => {
        const exists = prev.some(
          (message) =>
            message._id ===
            newMessage._id
        );

        if (exists) {
          return prev;
        }

        return [...prev, newMessage];
      });

      // Send through Socket.IO
      socket.emit("sendMessage", {
        _id: newMessage._id,
        senderId: currentUserId,
        receiverId: otherUserId,
        conversationId: id,
        sender: newMessage.sender,
        text: newMessage.text,
        image:
          newMessage.image || "",
        createdAt:
          newMessage.createdAt,
        delivered: false,
        seen: false,
      });

      // Stop typing
      socket.emit(
        "stopTyping",
        {
          senderId: currentUserId,
          receiverId: otherUserId,
        }
      );

      setText("");
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to send message"
      );
    }
  };

  // ==================================================
  // Handle Typing
  // ==================================================

  const handleTyping = (e) => {
    const value = e.target.value;

    setText(value);

    if (!otherUserId) {
      return;
    }

    if (value.trim()) {
      socket.emit(
        "typing",
        {
          senderId: currentUserId,
          receiverId: otherUserId,
        }
      );
    }

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current =
      setTimeout(() => {
        socket.emit(
          "stopTyping",
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          }
        );
      }, 1000);
  };

  // ==================================================
  // Key Press
  // ==================================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ==================================================
  // Message Status
  // ==================================================

  const MessageStatus = ({
    message,
    mine,
  }) => {
    if (!mine) {
      return null;
    }

    // Seen
    if (message.seen) {
      return (
        <CheckCheck
          size={15}
          className="text-cyan-300 inline-block ml-1"
        />
      );
    }

    // Delivered
    if (message.delivered) {
      return (
        <CheckCheck
          size={15}
          className="text-white inline-block ml-1"
        />
      );
    }

    // Sent
    return (
      <Check
        size={15}
        className="text-blue-100 inline-block ml-1"
      />
    );
  };

  // ==================================================
  // JSX
  // ==================================================

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white pb-24">

        <div className="max-w-4xl mx-auto">

          {/* ================= HEADER ================= */}

          <div className="sticky top-16 z-20 bg-slate-900 border-b border-slate-800 p-5 flex items-center gap-4">

            <button
              onClick={() =>
                navigate("/chat")
              }
              className="p-2 rounded-full hover:bg-slate-800 hover:text-blue-400 transition"
            >
              <ArrowLeft size={24} />
            </button>

            {otherUser?.profilePic ? (
              <img
                src={`https://connecthub-backend-1kue.onrender.com${otherUser.profilePic}`}
                alt={otherUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                {otherUser?.name
                  ?.charAt(0)
                  .toUpperCase() ||
                  "U"}
              </div>
            )}

            <div className="flex-1">

              <h2 className="text-xl font-bold">
                {otherUser?.name ||
                  "User"}
              </h2>

              {isTyping ? (
                <p className="text-sm text-blue-400">
                  typing...
                </p>
              ) : (
                <p
                  className={`text-sm font-medium ${
                    isOnline
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}
                >
                  {isOnline
                    ? "🟢 Online"
                    : "⚫ Offline"}
                </p>
              )}

            </div>

          </div>

          {/* ================= MESSAGES ================= */}

          <div className="p-6 space-y-4 min-h-[65vh]">

            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">

                <div className="text-5xl mb-4">
                  👋
                </div>

                <p className="text-lg">
                  Start your conversation
                </p>

                <p className="text-sm mt-2">
                  Send a message to{" "}
                  {otherUser?.name}
                </p>

              </div>
            ) : (
              messages.map(
                (message) => {

                  const senderId =
                    message.sender?._id ||
                    message.sender;

                  const mine =
                    senderId
                      ?.toString() ===
                    currentUserId?.toString();

                  return (
                    <div
                      key={
                        message._id ||
                        `${senderId}-${message.createdAt}`
                      }
                      className={`flex ${
                        mine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                          mine
                            ? "bg-blue-600 rounded-br-md"
                            : "bg-slate-800 rounded-bl-md"
                        }`}
                      >

                        {message.image && (
                          <img
                            src={`https://connecthub-backend-1kue.onrender.com${message.image}`}
                            alt="Message"
                            className="rounded-lg mb-2 max-h-64 object-cover"
                          />
                        )}

                        {message.text && (
                          <p className="break-words whitespace-pre-wrap">
                            {message.text}
                          </p>
                        )}

                        <div className="flex justify-end items-center mt-2">

                          <span
                            className={`text-[10px] ${
                              mine
                                ? "text-blue-100"
                                : "text-gray-400"
                            }`}
                          >
                            {new Date(
                              message.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </span>

                          <MessageStatus
                            message={message}
                            mine={mine}
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )
            )}

            <div ref={bottomRef} />

          </div>

          {/* ================= TYPING ================= */}

          {isTyping && (
            <div className="px-6 pb-2">

              <div className="flex items-center gap-2 text-gray-400 text-sm">

                <span>
                  {otherUser?.name}{" "}
                  is typing
                </span>

                <span className="flex gap-1">

                  <span className="animate-bounce">
                    •
                  </span>

                  <span
                    className="animate-bounce"
                    style={{
                      animationDelay:
                        "0.15s",
                    }}
                  >
                    •
                  </span>

                  <span
                    className="animate-bounce"
                    style={{
                      animationDelay:
                        "0.3s",
                    }}
                  >
                    •
                  </span>

                </span>

              </div>

            </div>
          )}

          {/* ================= INPUT ================= */}

          <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-4">

            <div className="flex items-center gap-3">

              <input
                type="text"
                value={text}
                onChange={handleTyping}
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Type your message..."
                className="flex-1 bg-slate-800 text-white rounded-xl px-5 py-3 outline-none border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
              />

              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-gray-500 px-5 py-3 rounded-xl transition"
              >
                <Send size={22} />
              </button>

            </div>

          </div>

        </div>

      </div>

      <BottomBar />
    </>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==========================
  // FETCH PROFILE
  // ==========================
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = res.data.user;

      setName(user.name || "");
      setBio(user.bio || "");

      // ✅ FIXED (important)
      if (
        user.profilePic &&
        user.profilePic !== "undefined"
      ) {
        const pic = user.profilePic;

        setPreview(
          pic.startsWith("http")
            ? pic
            : `https://connecthub-backend-1kue.onrender.com${pic}`
        );
      } else {
        setPreview("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================
  // UPDATE PROFILE
  // ==========================
  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("bio", bio);

      // ✅ only append if exists
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const res = await api.put(
        "/users/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      toast.success("Profile Updated");

      navigate("/profile");
    } catch (err) {
      console.log(err);
      toast.error("Update Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center p-6">
      <form
        onSubmit={updateProfile}
        className="bg-slate-900 p-8 rounded-2xl w-full max-w-lg border border-slate-800"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          Edit Profile
        </h1>

        {/* PROFILE IMAGE */}
        <div className="flex justify-center mb-6">
          <label className="cursor-pointer">
            {preview ? (
              <img
                src={preview}
                alt="profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-4xl font-bold">
                {name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (!file) return;

                setProfilePic(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
        </div>

        {/* NAME */}
        <input
          type="text"
          placeholder="Name"
          className="w-full bg-slate-800 p-4 rounded-xl mb-4 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* BIO */}
        <textarea
          placeholder="Bio"
          rows="4"
          className="w-full bg-slate-800 p-4 rounded-xl mb-6 outline-none resize-none"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {/* BUTTON */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-semibold">
          Save Changes
        </button>
      </form>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

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

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setName(res.data.user.name);
      setBio(res.data.user.bio);

      if (res.data.user.profilePic) {
        setPreview(`http://localhost:5000${res.data.user.profilePic}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("bio", bio);

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
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center p-6">

        <form
          onSubmit={updateProfile}
          className="bg-slate-900 p-8 rounded-2xl w-full max-w-lg border border-slate-800"
        >

          <h1 className="text-3xl font-bold mb-8 text-center">
            Edit Profile
          </h1>

          <div className="flex justify-center mb-6">

            <label className="cursor-pointer">

              <img
                src={
                  preview ||
                  "https://via.placeholder.com/150"
                }
                alt=""
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  setProfilePic(e.target.files[0]);

                  setPreview(
                    URL.createObjectURL(e.target.files[0])
                  );
                }}
              />

            </label>

          </div>

          <input
            type="text"
            placeholder="Name"
            className="w-full bg-slate-800 p-4 rounded-xl mb-4 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            placeholder="Bio"
            rows="4"
            className="w-full bg-slate-800 p-4 rounded-xl mb-6 outline-none resize-none"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-semibold"
          >
            Save Changes
          </button>

        </form>

      </div>
    </>
  );
}
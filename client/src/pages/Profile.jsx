  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-10">

          {/* PROFILE CARD */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">

            <div className="flex flex-col md:flex-row items-center gap-8">

              {getImage(user.profilePic) ? (
                <img
                  src={getImage(user.profilePic)}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/40"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-400">{user.email}</p>

                <div className="flex gap-6 mt-4">
                  <span><b>{posts.length}</b> Posts</span>
                  <span><b>{user.followers?.length}</b> Followers</span>
                  <span><b>{user.following?.length}</b> Following</span>
                </div>

                <button
                  onClick={() => navigate("/edit-profile")}
                  className="mt-4 px-5 py-2 bg-blue-600 rounded-xl hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* POSTS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.03] transition"
              >

                {getImage(post.image) && (
                  <img
                    src={getImage(post.image)}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4">
                  <p className="text-sm text-gray-300">
                    {post.caption}
                  </p>

                  <div className="flex justify-between mt-3">
                    <span>❤️ {post.likes?.length}</span>

                    <button onClick={() => deletePost(post._id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          <h2 className="text-xl font-semibold">
            Discover People
          </h2>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">

            {users.map((person) => (
              <div
                key={person._id}
                className="flex items-center justify-between"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/users/${person._id}`)}
                >
                  {getImage(person.profilePic) ? (
                    <img
                      src={getImage(person.profilePic)}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      {person.name?.charAt(0)}
                    </div>
                  )}

                  <div>
                    <p className="text-sm">{person.name}</p>
                    <p className="text-xs text-gray-400">
                      {person.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => followUser(person._id)}
                  className="text-xs px-3 py-1 bg-blue-600 rounded"
                >
                  Follow
                </button>
              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">

      {/* ================= LEFT SIDE ================= */}
      <div className="lg:col-span-2 space-y-10">

        {/* 🔥 PROFILE CARD */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {getImage(user.profilePic) ? (
              <img
                src={getImage(user.profilePic)}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/40"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
                {user.name?.charAt(0)}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>

              <div className="flex gap-6 mt-4">
                <span><b>{posts.length}</b> Posts</span>
                <span><b>{user.followers?.length}</b> Followers</span>
                <span><b>{user.following?.length}</b> Following</span>
              </div>

              <button
                onClick={() => navigate("/edit-profile")}
                className="mt-4 px-5 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* 🔥 POSTS GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.03] transition duration-300"
            >
              {getImage(post.image) && (
                <img
                  src={getImage(post.image)}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-4">
                <p className="text-sm text-gray-300">
                  {post.caption}
                </p>

                <div className="flex justify-between mt-3">
                  <span>❤️ {post.likes?.length}</span>

                  <button onClick={() => deletePost(post._id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="space-y-6">

        <h2 className="text-xl font-semibold">
          Discover People
        </h2>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">

          {users.map((person) => (
            <div
              key={person._id}
              className="flex items-center justify-between hover:bg-white/5 p-2 rounded-lg transition"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/users/${person._id}`)}
              >
                {getImage(person.profilePic) ? (
                  <img
                    src={getImage(person.profilePic)}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    {person.name?.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {person.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => followUser(person._id)}
                className="text-xs px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Follow
              </button>
            </div>
          ))}

        </div>

      </div>

    </div>
  </div>
);
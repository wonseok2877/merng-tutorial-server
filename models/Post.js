const mongoose = require("mongoose");

// new Schema
const postSchema = new mongoose.Schema({
  body: String,
  username: String,
  createdAt: String,
  // comments의 애기들은 객체이지만, array로 정렬해서 나중에 그 안에서 고를 수 잇도록.
  comments: [
    {
      body: {
        type: String,
      },
      username: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("Post", postSchema);

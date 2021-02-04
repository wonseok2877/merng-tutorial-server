/* schema !
mongoDB doesn't need schema, but to make it safe with our server codes.*/
const mongoose = require("mongoose");

// new Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
});

module.exports = mongoose.model("User", userSchema);

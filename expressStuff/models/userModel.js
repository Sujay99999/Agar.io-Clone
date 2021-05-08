const mongoose = require("mongoose");

// This Schema is only for user that are authenticated
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every user must have a name"],
  },
  googleId: {
    type: Number,
    unique: [true, "Every authenticated user must have a unique GoogleID"],
    required: [true, "Every authenticated user must have GoogleID"],
  },
  avatar: {
    type: String,
  },
  highestScore: {
    type: Number,
    default: 0,
  },
  lastVisited: {
    type: Date,
    default: Date.now(),
  },
});

const User = new mongoose.model("User", userSchema);

module.exports = User;

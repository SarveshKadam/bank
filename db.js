const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://Sarvesh_001:1905%23Chelsea@myproject1.6dr7h.mongodb.net/paytm"
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

const User = mongoose.model("User", userSchema);

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = {
  User,
  Account,
};

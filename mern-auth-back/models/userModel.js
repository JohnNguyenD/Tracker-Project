const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true, minlength: 5 },
  displayName: { type: String },
  isWarehouse: { type: String },
});

module.exports = User = mongoose.model("user", userSchema);

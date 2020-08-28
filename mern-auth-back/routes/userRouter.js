const { request, response, json } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/userModel");

//Check register
router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName, isWarehouse } = req.body;

    //Validate
    if (!email || !password || !passwordCheck) {
      return res.status(400).json({ msg: "Not all fields have been filled" });
    }
    if (password.length < 5) {
      return res
        .status(400)
        .json({ msg: "Password need to be 5 characters long" });
    }
    if (password !== passwordCheck) {
      return res.status(400).json({ msg: "Password must be the same" });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res.status(400).json({ msg: "User already existed" });
    if (!displayName) displayName = email;

    //hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    //save new user
    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
      isWarehouse,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validate
    if (!email || !password)
      return res.status(400).json({ msg: "Not all fields have been filled" });

    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account in this user has been create" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    //Assign Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        isWarehouse: user.isWarehouse,
      },
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

//Delete account if needed
router.delete("/delete", auth, async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.user);
    res.json(deleteUser);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

//Check Token (Will be used to validate in login and logout)
router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (!verify) return res.json(false);
    const user = await User.findById(verify.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

//Authenticate
router.get("/auth", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json(user);
});
module.exports = router;

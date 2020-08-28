const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({ msg: "No authenticated token found" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res.status(401).json({ msg: "No authenticated token found" });

    req.user = verified.id;
    next();
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

module.exports = auth;

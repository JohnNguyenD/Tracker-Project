const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { request } = require("express");

const app = express();

app.get("/api", (req, res) => {
  res.json({
    message: "welcome to the API",
  });
});

app.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "Post created..",
        authData,
      });
    }
  });
});

app.post("/api/login", (req, res) => {
  //Mock user
  const user = {
    id: 1,
    username: "brad@gmail.com",
    password: "brad",
  };
  jwt.sign({ user: user }, "secretKey", (err, token) => {
    res.json({
      token,
    });
  });
});

//Format of token

function verifyToken(req, res, next) {
  //get auth header value
  const bearerHeader = req.headers["authorization"];
  //check if undefined
  if (typeof bearerHeader !== "undefined") {
    //Split at the space
    const bearer = bearerHeader.split(" ");
    //Get token from array
    const bearerToken = bearer[1];
    //Set the token
    req.token = bearerToken;
    //Middleware
    next();
  } else {
    res.sendStatus(403);
  }
}

app.listen(5000, () => {
  console.log("Server started on port 5000");
});

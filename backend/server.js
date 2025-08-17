// backend/server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

// Simple in-memory user store (replace with DB later)
let users = {};
let SECRET = "supersecret123";

const app = express();
app.use(bodyParser.json());

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.status(400).json({ error: "User exists" });
  const hash = await bcrypt.hash(password, 10);
  users[username] = { password: hash, avatar: null };
  res.json({ success: true });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(400).json({ error: "No such user" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Get user avatar
app.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    const { username } = jwt.verify(auth.split(" ")[1], SECRET);
    res.json({ username, avatar: users[username].avatar });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Save avatar
app.post("/avatar", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    const { username } = jwt.verify(auth.split(" ")[1], SECRET);
    users[username].avatar = req.body.avatar;
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// WebSocket server for multiplayer
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = {};

wss.on("connection", (ws) => {
  let playerId = null;

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "join") {
      playerId = data.id;
      players[playerId] = { ws, avatar: data.avatar };
      // notify others
      broadcast({ type: "spawn", id: playerId, avatar: data.avatar }, ws);
    }

    if (data.type === "update") {
      broadcast({ ...data, id: playerId }, ws);
    }

    if (data.type === "chat") {
      broadcast({ ...data, id: playerId }, ws);
    }
  });

  ws.on("close", () => {
    if (playerId && players[playerId]) {
      delete players[playerId];
      broadcast({ type: "despawn", id: playerId });
    }
  });
});

function broadcast(msg, except) {
  Object.values(players).forEach((p) => {
    if (p.ws !== except && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(JSON.stringify(msg));
    }
  });
}

server.listen(3000, () => console.log("Server on http://localhost:3000"));

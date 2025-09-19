import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;
const MODE_DEFAULT = process.env.MODE_DEFAULT || "party";

const story = JSON.parse(fs.readFileSync("./story/chapter1.json", "utf8"));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("web"));

let sessions = {}; // { sessionId: { players: {}, node: "" } }

io.on("connection", (socket) => {
  socket.on("joinSession", ({ sessionId, player }) => {
    if (!sessions[sessionId]) {
      sessions[sessionId] = { mode: MODE_DEFAULT, players: {}, node: story.startNode };
    }
    sessions[sessionId].players[socket.id] = { id: socket.id, player, node: story.startNode };
    socket.join(sessionId);

    io.to(sessionId).emit("sessionState", sessions[sessionId]);
  });

  socket.on("makeChoice", ({ sessionId, choiceId }) => {
    const session = sessions[sessionId];
    if (!session) return;

    const currentNode = story.nodes[session.node];
    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) return;

    session.node = choice.leadsTo;
    io.to(sessionId).emit("newNode", { nodeId: session.node, node: story.nodes[session.node] });
  });

  socket.on("disconnect", () => {
    for (let sid in sessions) {
      delete sessions[sid].players[socket.id];
    }
  });
});

httpServer.listen(PORT, () => console.log(`COTM server running on ${PORT}`));

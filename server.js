// ...top stays the same
io.on("connection", (socket) => {
  socket.on("joinSession", ({ sessionId, player }) => {
    if (!sessions[sessionId]) {
      sessions[sessionId] = { mode: MODE_DEFAULT, players: {}, node: story.startNode };
    }
    sessions[sessionId].players[socket.id] = { id: socket.id, player, node: story.startNode };
    socket.join(sessionId);

    const nodeId = sessions[sessionId].node;
    // ⬇️ send both nodeId and full node object
    io.to(sessionId).emit("sessionState", {
      ...sessions[sessionId],
      nodeId,
      node: story.nodes[nodeId]
    });
  });

  socket.on("makeChoice", ({ sessionId, choiceId }) => {
    const session = sessions[sessionId];
    if (!session) return;

    const currentNode = story.nodes[session.node];
    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (!choice) return;

    session.node = choice.leadsTo;
    const nodeId = session.node;
    // ⬇️ also send full node here (was already close to this)
    io.to(sessionId).emit("newNode", { nodeId, node: story.nodes[nodeId] });
  });

  socket.on("disconnect", () => {
    for (let sid in sessions) delete sessions[sid].players[socket.id];
  });
});
// ...rest stays the same

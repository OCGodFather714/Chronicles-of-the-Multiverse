const socket = io();
const sessionId = "test-session"; // later: random or lobby code
const player = { name: "Player1" };

socket.emit("joinSession", { sessionId, player });

socket.on("sessionState", (state) => {
  renderNode(state.node, state);
});

socket.on("newNode", ({ nodeId, node }) => {
  renderNode(nodeId, { node });
});

function renderNode(nodeId, state) {
  const node = state.node || (state.nodes ? state.nodes[nodeId] : null);
  if (!node) return;
  const div = document.getElementById("game");
  div.innerHTML = `
    <h2>${node.speaker}</h2>
    <p>${node.text}</p>
    <div>
      ${node.choices.map(c => `<button onclick="choose('${c.id}')">${c.label}</button>`).join("")}
    </div>
  `;
}

function choose(choiceId) {
  socket.emit("makeChoice", { sessionId, choiceId });
}

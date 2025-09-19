const socket = io();
const sessionId = "test-session"; // later: random/lobby code
const player = { name: "Player1" };

socket.emit("joinSession", { sessionId, player });

socket.on("sessionState", (state) => {
  renderNode(state.node); // state.node is the full node object now
});
socket.on("newNode", ({ node }) => {
  renderNode(node);
});

function renderNode(node) {
  if (!node) return;
  const div = document.getElementById("game");
  div.innerHTML = `
    <h2>${node.speaker}</h2>
    <p>${node.text}</p>
    <div>${node.choices.map(c => `
      <button onclick="choose('${c.id}')">${c.label}</button>
    `).join("")}</div>
  `;

  if (node.end) {
    div.insertAdjacentHTML("beforeend",
      `<div style="margin-top:16px;opacity:.9">
         <h3>Chapter Complete</h3>
         <p>Next: ${node.nextChapter || "TBD"}</p>
       </div>`
    );
  }
}

function choose(choiceId) {
  socket.emit("makeChoice", { sessionId, choiceId });
}

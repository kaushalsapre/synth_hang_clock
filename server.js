const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

// Setlist
const setlist = [
  { name: "Moss", duration: 10 },
  { name: "SFATC", duration: 15 },
  { name: "Bloop", duration: 15 },
  { name: "Moss", duration: 15 },
  { name: "Mandakini Cables", duration: 20 },
  { name: "Bloop", duration: 15 },
  { name: "SFATC", duration: 15 },
  { name: "Mandakini Cables", duration: 10 },
  { name: "Moss", duration: 5 },
];

let currentIndex = 0;
let currentStart = null;
let interval = null;

function broadcastState() {
  const now = Date.now();
  const elapsed = (now - currentStart) / 1000;
  const current = setlist[currentIndex];
  const remaining = current.duration * 60 - elapsed;

  if (remaining <= 0) {
    advanceAct();
  } else {
    io.emit("clockUpdate", {
      act: current.name,
      elapsed: elapsed,
      duration: current.duration * 60,
      next: (setlist[currentIndex + 1] && setlist[currentIndex + 1].name) || "End",
    });
  }
}

function advanceAct() {
  currentIndex++;

  if (currentIndex >= setlist.length) {
    clearInterval(interval);
    io.emit("clockEnd", { message: "Set complete" });
    return;
  }

  currentStart = Date.now();

  // Send immediate update for the new act
  io.emit("clockUpdate", {
    act: setlist[currentIndex].name,
    elapsed: 0,
    duration: setlist[currentIndex].duration * 60,
    next: (setlist[currentIndex + 1] && setlist[currentIndex + 1].name) || "End"
  });
}

function startShow() {
  currentIndex = 0;
  currentStart = Date.now();
  clearInterval(interval);

  io.emit("clockUpdate", {
    act: setlist[0].name,
    elapsed: 0,
    duration: setlist[0].duration * 60,
    next: setlist[1]?.name || "End"
  });

  interval = setInterval(broadcastState, 1000);
}


io.on("connection", (socket) => {
  console.log("Client connected");

  if (currentStart) {
    broadcastState(); // Send current state
  }

  socket.on("startShow", () => {
    startShow();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server at http://localhost:3000");
});

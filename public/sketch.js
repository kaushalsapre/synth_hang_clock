let actName = "";
let nextAct = "";
let elapsed = 0;
let duration = 0;
let running = false;
let isConductor = true; // Toggle this manually

let startBtn;

function setup() {
  createCanvas(400, 300);
  textAlign(CENTER, CENTER);
  textSize(32);

  if (isConductor) {
    startBtn = createButton("Start Show").position(150, 250).mousePressed(() => socket.emit("startShow"));
  }

  socket = io();

  socket.on("clockUpdate", (data) => {
    actName = data.act;
    nextAct = data.next;
    elapsed = data.elapsed;
    duration = data.duration;
    running = true;
  });

  socket.on("clockEnd", (data) => {
    running = false;
    actName = data.message;
  });
}

function draw() {
  background(0);
  fill(0, 255, 0);

  if (running) {
    let secs = floor(elapsed);
    let minutes = floor(secs / 60);
    let seconds = secs % 60;
    let timeStr = nf(minutes, 2) + ":" + nf(seconds, 2);
    text(`Act: ${actName}`, width / 2, 70);
    text(timeStr, width / 2, 140);
    text(`Next: ${nextAct}`, width / 2, 210);

    elapsed += deltaTime / 1000; // smooth client-side display
  } else {
    text("Waiting to start...", width / 2, height / 2);
  }
}

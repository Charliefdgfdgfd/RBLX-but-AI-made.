// === Global Variables ===
let token = null;
let socket = null;
let myPlayerId = Date.now().toString();
let currentAvatar = null;

let scene, camera, renderer, player, controls;
let players = new Map();
let keys = {};
let mouseX = 0;

// === Avatar Creator ===
function initAvatarCreator() {
  const preview = document.getElementById("avatar-preview");
  preview.innerHTML = "";
  const mesh = document.createElement("div");
  mesh.textContent = "👤 Avatar Preview";
  preview.appendChild(mesh);

  document.getElementById("create-avatar-btn").onclick = createAvatar;
}

function createAvatar() {
  const avatar = {
    name: document.getElementById("name").value || "Guest",
    role: document.getElementById("role").value || "Player",
    bodyScale: parseFloat(document.getElementById("body-scale").value),
    color: document.getElementById("color").value,
    accessory: document.getElementById("accessory").value
  };

  currentAvatar = avatar;

  // Hide creator, show game UI
  document.getElementById("avatar-creator").style.display = "none";
  document.getElementById("ui-overlay").style.display = "block";
  document.getElementById("players-list").style.display = "block";
  document.getElementById("chat-container").style.display = "block";

  initMainGame(avatar);
  connectWebSocket(avatar);
}

// === Three.js Game World ===
function initMainGame(avatar) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Player character
  player = {
    id: myPlayerId,
    avatar,
    position: new THREE.Vector3(0, 1.6, 0),
    rotation: 0,
    isDancing: false,
    character: createCharacterModel(avatar)
  };
  scene.add(player.character);
  players.set(player.id, player);

  camera.position.set(0, 1.6, 5);

  // Event listeners
  document.addEventListener("keydown", (e) => { keys[e.key.toLowerCase()] = true; });
  document.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
  window.addEventListener("mousemove", (e) => { mouseX = (e.clientX / window.innerWidth - 0.5) * Math.PI; });

  setupChat();
  animate();
}

// Character model
function createCharacterModel(avatar) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1 * avatar.bodyScale, 2 * avatar.bodyScale, 1 * avatar.bodyScale),
    new THREE.MeshBasicMaterial({ color: avatar.color })
  );
  group.add(body);
  return group;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.05;
  if (keys["w"]) player.position.z -= speed;
  if (keys["s"]) player.position.z += speed;
  if (keys["a"]) player.position.x -= speed;
  if (keys["d"]) player.position.x += speed;

  player.character.position.copy(player.position);
  player.character.rotation.y = mouseX;
  camera.position.set(player.position.x, player.position.y + 2, player.position.z + 5);
  camera.lookAt(player.position);

  sendMovementUpdate(player, mouseX);
  renderer.render(scene, camera);
}

// === Multiplayer (WebSockets) ===
function connectWebSocket(avatar) {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "join", id: myPlayerId, avatar }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "spawn") {
      if (!players.has(data.id)) {
        const newPlayer = {
          id: data.id,
          avatar: data.avatar,
          position: new THREE.Vector3(0, 1.6, 0),
          rotation: 0,
          isDancing: false,
          character: createCharacterModel(data.avatar)
        };
        scene.add(newPlayer.character);
        players.set(data.id, newPlayer);
        updatePlayersList();
      }

    } else if (data.type === "update") {
      const other = players.get(data.id);
      if (other && other.character) {
        other.character.position.set(data.pos.x, data.pos.y, data.pos.z);
        other.character.rotation.y = data.rot;
      }

    } else if (data.type === "chat") {
      const sender = players.get(data.id);
      if (sender) addChatMessage(sender.avatar.name, data.msg);

    } else if (data.type === "despawn") {
      const gone = players.get(data.id);
      if (gone) {
        scene.remove(gone.character);
        players.delete(data.id);
        updatePlayersList();
      }
    }
  };
}

function sendMovementUpdate(player, mouseX) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "update",
      pos: { x: player.position.x, y: player.position.y, z: player.position.z },
      rot: mouseX
    }));
  }
}

// === Chat ===
function setupChat() {
  const chatInput = document.getElementById("chat-input");
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const message = chatInput.value.trim();
      if (message !== "") {
        addChatMessage(currentAvatar.name, message);
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "chat", msg: message }));
        }
        chatInput.value = "";
      }
    }
  });
}

function addChatMessage(sender, message) {
  const box = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.textContent = `${sender}: ${message}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// === UI Helpers ===
function updatePlayersList() {
  const list = document.getElementById("players-list");
  list.innerHTML = "<h3>Players</h3>";
  players.forEach((p) => {
    const div = document.createElement("div");
    div.textContent = p.avatar.name + " (" + p.avatar.role + ")";
    list.appendChild(div);
  });
}

// === Login ===
document.getElementById("login-btn").onclick = async () => {
  const u = document.getElementById("login-username").value;
  const p = document.getElementById("login-password").value;
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("avatar-creator").style.display = "block";
    initAvatarCreator();
  } else {
    document.getElementById("login-status").textContent = data.error || "Login failed";
  }
};

document.getElementById("register-btn").onclick = async () => {
  const u = document.getElementById("login-username").value;
  const p = document.getElementById("login-password").value;
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  const data = await res.json();
  document.getElementById("login-status").textContent = data.success
    ? "Registered! Now log in."
    : data.error || "Error";
};

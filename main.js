import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const canvas = document.querySelector("#c");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7dd3fc);
scene.fog = new THREE.Fog(0x7dd3fc, 30, 160);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(20, 40, 10);
scene.add(sun);

const groundGeo = new THREE.PlaneGeometry(400, 400);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(400, 80, 0x94a3b8, 0x334155);
grid.position.y = 0.01;
scene.add(grid);

const player = {
  position: new THREE.Vector3(0, 1.6, 8),
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  onGround: false,
};

const keys = new Set();
const projectiles = [];
const builds = [];
const buildSize = 4;
let buildMode = "wall";

const buildPreviewMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.35,
});
let buildPreview = null;

function createBuildMesh(type) {
  if (type === "floor") {
    return new THREE.Mesh(
      new THREE.BoxGeometry(buildSize, 0.2, buildSize),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9 })
    );
  }
  if (type === "ramp") {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(buildSize, 0.25, buildSize),
      new THREE.MeshStandardMaterial({ color: 0xf97316 })
    );
    mesh.rotation.x = -Math.PI / 6;
    return mesh;
  }
  return new THREE.Mesh(
    new THREE.BoxGeometry(buildSize, 3, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x22c55e })
  );
}

function createPreview(type) {
  if (buildPreview) scene.remove(buildPreview);
  let geo;
  if (type === "floor") geo = new THREE.BoxGeometry(buildSize, 0.2, buildSize);
  else if (type === "ramp") geo = new THREE.BoxGeometry(buildSize, 0.25, buildSize);
  else geo = new THREE.BoxGeometry(buildSize, 3, 0.25);
  buildPreview = new THREE.Mesh(geo, buildPreviewMat);
  scene.add(buildPreview);
}

function snap(value) {
  return Math.round(value / buildSize) * buildSize;
}

function updatePreview() {
  if (!buildPreview) createPreview(buildMode);
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
  const pos = player.position.clone().add(dir.multiplyScalar(6));
  const snapped = new THREE.Vector3(snap(pos.x), 0, snap(pos.z));

  if (buildMode === "wall") {
    buildPreview.position.set(snapped.x, 1.5, snapped.z);
    buildPreview.rotation.set(0, Math.round(player.yaw / (Math.PI / 2)) * (Math.PI / 2), 0);
  } else if (buildMode === "ramp") {
    buildPreview.position.set(snapped.x, 0.15, snapped.z);
    buildPreview.rotation.set(-Math.PI / 6, Math.round(player.yaw / (Math.PI / 2)) * (Math.PI / 2), 0);
  } else {
    buildPreview.position.set(snapped.x, 0.1, snapped.z);
    buildPreview.rotation.set(0, 0, 0);
  }
}

function placeBuild() {
  const mesh = createBuildMesh(buildMode);
  mesh.position.copy(buildPreview.position);
  mesh.rotation.copy(buildPreview.rotation);
  scene.add(mesh);
  builds.push(mesh);
}

function shoot() {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(builds, false);
  if (hits.length) {
    const target = hits[0].object;
    scene.remove(target);
    const idx = builds.indexOf(target);
    if (idx >= 0) builds.splice(idx, 1);
    return;
  }
  const geometry = new THREE.SphereGeometry(0.08, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
  const bullet = new THREE.Mesh(geometry, material);
  bullet.position.copy(player.position);
  const direction = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
  projectiles.push({ mesh: bullet, velocity: direction.multiplyScalar(32), life: 2.5 });
  scene.add(bullet);
}

function onPointerMove(event) {
  if (!document.pointerLockElement) return;
  player.yaw -= event.movementX * 0.002;
  player.pitch -= event.movementY * 0.002;
  player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch));
}

function onMouseDown(event) {
  if (!document.pointerLockElement) {
    canvas.requestPointerLock();
    return;
  }
  if (event.button === 0) shoot();
  if (event.button === 2) placeBuild();
}

window.addEventListener("mousemove", onPointerMove);
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (e.code === "KeyQ") buildMode = "wall";
  if (e.code === "KeyE") buildMode = "floor";
  if (e.code === "KeyF") buildMode = "ramp";
});
window.addEventListener("keyup", (e) => keys.delete(e.code));

function updatePlayer(dt) {
  const speed = keys.has("ShiftLeft") ? 9 : 5.5;
  const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
  const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);

  const move = new THREE.Vector3();
  if (keys.has("KeyW")) move.add(forward);
  if (keys.has("KeyS")) move.sub(forward);
  if (keys.has("KeyD")) move.add(right);
  if (keys.has("KeyA")) move.sub(right);
  move.normalize();

  player.velocity.x = move.x * speed;
  player.velocity.z = move.z * speed;
  player.velocity.y -= 18 * dt;

  if (player.onGround && keys.has("Space")) {
    player.velocity.y = 7.5;
    player.onGround = false;
  }

  player.position.addScaledVector(player.velocity, dt);

  if (player.position.y <= 1.6) {
    player.position.y = 1.6;
    player.velocity.y = 0;
    player.onGround = true;
  }

  camera.position.copy(player.position);
  camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");
}

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    p.velocity.y -= 9 * dt;
    p.mesh.position.addScaledVector(p.velocity, dt);
    if (p.life <= 0 || p.mesh.position.y < -5) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
    }
  }
}

const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.03);
  updatePlayer(dt);
  updateProjectiles(dt);
  updatePreview();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});

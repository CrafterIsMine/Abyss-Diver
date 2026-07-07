import {isDown, clearPressed} from '../lib/input.js';
import {updateChunks, activeEnts} from '../world/chunks.js';
import {genChunkContents} from '../world/generate.js';
import {vsl, tickVsl, drawVsl} from '../entities/vessel.js';
import {tickMonsters, drawMonster} from '../entities/monsters.js';
import {tickPtc, drawPtc, tickDrops, drawDrops, spawnPtc, spawnDrop} from '../entities/particles.js';
import {updateHud, drawSonar} from '../ui/hud.js';
import {gameState, triggerDeath} from '../ui/menus.js';
import {playHit, playBreak, playPing, playCollect} from '../lib/audio.js';
const cv = document.getElementById('cv');
const cx = cv.getContext('2d');
let W, H;
function resize(){
W = cv.width = window.innerWidth;
H = cv.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const cam={
x: 0, y: 0,
shake: 0,
shake_x: 0, shake_y: 0
};

let lastPing = 0;
let prevScrap = 0;

function resolveCollisions(){
const v_spd = Math.sqrt(vsl.vx * vsl.vx + vsl.vy * vsl.vy);
const ramMult = 1 + vsl.upgrades.ram * 0.4;
const damageReduction = 1 / (1 + vsl.upgrades.ram * 0.3);

for(let i = 0; i < activeEnts.length; i++){
const e = activeEnts[i];

if(e.t === 'rock'){
const dx = vsl.x - e.x, dy = vsl.y - e.y;
const dist = Math.sqrt(dx * dx + dy * dy);
const min_d = vsl.r + e.r;
if(dist < min_d && dist > 0){
const nx = dx / dist, ny = dy / dist;
const overlap = min_d - dist;
vsl.x += nx * overlap;
vsl.y += ny * overlap;
const rel_v = vsl.vx * nx + vsl.vy * ny;
if(rel_v < 0){
vsl.vx -= 1.6 * rel_v * nx;
vsl.vy -= 1.6 * rel_v * ny;
if(v_spd > 120){
vsl.hp -= v_spd * 0.06 * damageReduction;
cam.shake = Math.min(25, v_spd * 0.12);
playHit(v_spd);
for(let j = 0; j < 12; j++){
spawnPtc(vsl.x + nx * vsl.r, vsl.y + ny * vsl.r, (Math.random()-0.5)*250, (Math.random()-0.5)*250, 0.9, '#aaa', 3);
 }
  }
}
 }
}

if(e.t === 'mon' && e.hp > 0){
const dx = vsl.x - e.x, dy = vsl.y - e.y;
const dist = Math.sqrt(dx * dx + dy * dy);
const min_d = vsl.r + e.r;

if(dist < min_d && dist > 0){
const nx = dx / dist, ny = dy / dist;
const overlap = min_d - dist;

const total_mass = vsl.mass + e.mass;
vsl.x += nx * overlap * (e.mass / total_mass);
vsl.y += ny * overlap * (vsl.mass / total_mass);
e.x -= nx * overlap * (vsl.mass / total_mass);
e.y -= ny * overlap * (vsl.mass / total_mass);
const dvx = vsl.vx - e.vx, dvy = vsl.vy - e.vy;
const rel_vn = dvx * nx + dvy * ny;

if(rel_vn < 0){
const impulse = -(1.6) * rel_vn / (1/vsl.mass + 1/e.mass);
vsl.vx += (impulse / vsl.mass) * nx;
vsl.vy += (impulse / vsl.mass) * ny;
e.vx -= (impulse / e.mass) * nx;
e.vy -= (impulse / e.mass) * ny;
const impact_force = Math.abs(impulse);

if(impact_force > 400){
const dmg = impact_force * 0.025 * ramMult;
e.hp -= dmg;
e.flash = 0.25;

if(vsl.invuln <= 0){
const playerDmg = impact_force * 0.015 * damageReduction;
vsl.hp -= playerDmg;
vsl.invuln = 0.4;
}

cam.shake = Math.min(35, impact_force * 0.02);
playHit(impact_force);
const pcx = (vsl.x + e.x) / 2;
const pcy = (vsl.y + e.y) / 2;
const p_count = Math.min(35, Math.floor(impact_force * 0.025));
for(let j = 0; j < p_count; j++){
const a = Math.random() * Math.PI * 2;
const s = Math.random() * impact_force * 0.25;
const c = e.m_type === 'jelly' ? '#ff00ff' : '#ff2222';
spawnPtc(pcx, pcy, Math.cos(a)*s, Math.sin(a)*s, 1.2, c, 2 + Math.random() * 5);
}

if(e.hp <= 0){
const drop_val = Math.floor(e.max_hp * 0.4);
spawnDrop(e.x, e.y, drop_val);
for(let j = 0; j < 45; j++){
const a = Math.random() * Math.PI * 2;
const s = Math.random() * 350;
spawnPtc(e.x, e.y, Math.cos(a)*s, Math.sin(a)*s, 2.5, '#ff4444', 3 + Math.random() * 6);
 }
}
}
else if(impact_force > 150){
e.flash = 0.15;
if(vsl.invuln <= 0 && e.state === 'charge'){
vsl.hp -= 8 * damageReduction;
vsl.invuln = 0.5;
cam.shake = 8;
 }
  } 
}
}
}
}
}

function drawBg(){
const dist = Math.sqrt(vsl.x * vsl.x + vsl.y * vsl.y);
const depth_factor = Math.min(1, dist / 12000);

const r1 = 2, g1 = 12, b1 = 25;
const r2 = 0, g2 = 2, b2 = 6;
const r = Math.floor(r1 + (r2 - r1) * depth_factor);
const g = Math.floor(g1 + (g2 - g1) * depth_factor);
const b = Math.floor(b1 + (b2 - b1) * depth_factor);
cx.fillStyle = `rgb(${r},${g},${b})`;
cx.fillRect(0, 0, W, H);
cx.save();
cx.translate(W/2 - cam.x * 0.3 + cam.shake_x, H/2 - cam.y * 0.3 + cam.shake_y);
const grid_sz = 300;
const start_x = Math.floor((cam.x * 0.3 - W/2) / grid_sz) * grid_sz;
const start_y = Math.floor((cam.y * 0.3 - H/2) / grid_sz) * grid_sz;
cx.strokeStyle = `rgba(30, 70, 100, ${0.15 - depth_factor * 0.1})`;
cx.lineWidth = 1;
cx.beginPath();
for(let x = start_x; x < cam.x * 0.3 + W/2; x += grid_sz){
cx.moveTo(x, cam.y * 0.3 - H/2);
cx.lineTo(x, cam.y * 0.3 + H/2);
}
for(let y = start_y; y < cam.y * 0.3 + H/2; y += grid_sz){
cx.moveTo(cam.x * 0.3 - W/2, y);
cx.lineTo(cam.x * 0.3 + W/2, y);
}
cx.stroke();
cx.restore();
}

function drawWorld(){
cx.save();
cx.translate(W/2 - cam.x + cam.shake_x, H/2 - cam.y + cam.shake_y);
const view_l = cam.x - W/2 - 150;
const view_r = cam.x + W/2 + 150;
const view_t = cam.y - H/2 - 150;
const view_b = cam.y + H/2 + 150;

for(let i = 0; i < activeEnts.length; i++){
const e = activeEnts[i];
if(e.x < view_l || e.x > view_r || e.y < view_t || e.y > view_b)
continue;

if(e.t === 'kelp'){
cx.strokeStyle = '#1a5a3a';
cx.lineWidth = 5;
cx.lineCap = 'round';
cx.beginPath();
const t = performance.now() * 0.001;
for(let j = 0; j < e.segs.length; j++){
const s = e.segs[j];
const ox = Math.sin(t + e.phase + j * 0.6) * (j * 2.5);
if(j === 0)
cx.moveTo(s.x + ox, s.y);
else
cx.lineTo(s.x + ox, s.y);
}
cx.stroke();
}

if(e.t === 'rock'){
cx.fillStyle = '#2a2a3a';
cx.strokeStyle = '#151520';
cx.lineWidth = 3;
cx.beginPath();
for(let j = 0; j < e.verts.length; j++){
const a = e.ang + (j / e.verts.length) * Math.PI * 2;
const r = e.r * e.verts[j];
const px = e.x + Math.cos(a) * r;
const py = e.y + Math.sin(a) * r;
if(j === 0)
cx.moveTo(px, py);
else
cx.lineTo(px, py);
}
cx.closePath();
cx.fill();
cx.stroke();
}

if(e.t === 'vent'){
const t = performance.now() * 0.002;
const grad = cx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r);
grad.addColorStop(0, `rgba(255, 120, 20, ${0.4 + Math.sin(t + e.phase) * 0.15})`);
grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
cx.fillStyle = grad;
cx.beginPath();
cx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
cx.fill();

if(Math.random() < 0.25){
spawnPtc(e.x + (Math.random()-0.5)*25, e.y, (Math.random()-0.5)*40, -60 - Math.random()*60, 2.5, 'rgba(255,160,60,0.7)', 6);
 } 
}

if(e.t === 'mon'){
drawMonster(cx, e);
 }
}
drawDrops(cx);
drawPtc(cx);
drawVsl(cx);
cx.restore();
}

let last_t = 0;
let acc = 0;
const fixed_dt = 1 / 60;

function loop(t){
requestAnimationFrame(loop);

if(!last_t)
last_t = t;
let frame_dt = (t - last_t) / 1000;
last_t = t;
if(frame_dt > 0.1)
frame_dt = 0.1;
if(gameState.val === 'playing'){
acc += frame_dt;

while(acc >= fixed_dt){
tickVsl(fixed_dt);
tickMonsters(fixed_dt, activeEnts);
tickDrops(fixed_dt, vsl);
tickPtc(fixed_dt);
resolveCollisions();
acc -= fixed_dt;
}

updateChunks(vsl.x, vsl.y, genChunkContents);
cam.x += (vsl.x - cam.x) * 0.12;
cam.y += (vsl.y - cam.y) * 0.12;

if(cam.shake > 0){
cam.shake_x = (Math.random() - 0.5) * cam.shake;
cam.shake_y = (Math.random() - 0.5) * cam.shake;
cam.shake *= 0.88;
if(cam.shake < 0.5)
cam.shake = 0;
}
else{
cam.shake_x = 0;
cam.shake_y = 0;
}

if(vsl.hp <= 0){
playBreak();
cam.shake = 40;
for(let i = 0; i < 120; i++){
const a = Math.random() * Math.PI * 2;
const s = Math.random() * 500;
spawnPtc(vsl.x, vsl.y, Math.cos(a)*s, Math.sin(a)*s, 3, '#ff4400', 5 + Math.random() * 5);
 }
triggerDeath();
}

const now = performance.now();
if(now - lastPing > 4000){
playPing();
lastPing = now;
}

if(vsl.scrap > prevScrap){
playCollect();
prevScrap = vsl.scrap;
}

updateHud();
drawSonar();
}

drawBg();
if(gameState.val === 'playing' || gameState.val === 'dead'){
drawWorld();
}
clearPressed();
}
requestAnimationFrame(loop);

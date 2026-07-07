import {updateChunks, activeEnts} from '../world/chunks.js';
import {genChunkContents} from '../world/generate.js';
import {vsl, drawVsl} from '../entities/vessel.js';
import {drawMonster} from '../entities/monsters.js';
import {drawDrops, drawPtc, spawnPtc} from '../entities/particles.js';
const cv = document.getElementById('cv');
const cx = cv.getContext('2d');
let W, H;
function resize(){
W = cv.width = window.innerWidth;
H = cv.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
const cam ={
x: 0,
y: 0,
shake: 0,
shake_x: 0,
shake_y: 0 
};
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
for(let i = 0; i < activeEnts.length; i++) {
const e = activeEnts[i];
if(e.x < view_l || e.x > view_r || e.y < view_t || e.y > view_b)
continue;
if(e.t === 'kelp'){
cx.strokeStyle = '#1a5a3a'; cx.lineWidth = 5; cx.lineCap = 'round'; cx.beginPath();
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
cx.fillStyle = '#2a2a3a'; cx.strokeStyle = '#151520'; cx.lineWidth = 3; cx.beginPath();
for(let j = 0; j < e.verts.length; j++){
const a = e.ang + (j / e.verts.length) * Math.PI * 2;
const r = e.r * e.verts[j];
const px = e.x + Math.cos(a) * r; const py = e.y + Math.sin(a) * r;
if(j === 0)
cx.moveTo(px, py);
else
cx.lineTo(px, py);
}
cx.closePath(); cx.fill(); cx.stroke();
}
if(e.t === 'vent'){
const t = performance.now() * 0.002;
const grad = cx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r);
grad.addColorStop(0, `rgba(255, 120, 20, ${0.4 + Math.sin(t + e.phase) * 0.15})`);
grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
cx.fillStyle = grad; cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, Math.PI * 2); cx.fill();
if(Math.random() < 0.25)
spawnPtc(e.x + (Math.random()-0.5)*25, e.y, (Math.random()-0.5)*40, -60 - Math.random()*60, 2.5, 'rgba(255,160,60,0.7)', 6);
}
if(e.t === 'mon')
drawMonster(cx, e);
}
drawDrops(cx); drawPtc(cx); drawVsl(cx);
cx.restore();
}
function loop(){
requestAnimationFrame(loop);
cam.x += (vsl.x - cam.x) * 0.12;
cam.y += (vsl.y - cam.y) * 0.12;
updateChunks(vsl.x, vsl.y, genChunkContents);
drawBg();
drawWorld();
}
requestAnimationFrame(loop);

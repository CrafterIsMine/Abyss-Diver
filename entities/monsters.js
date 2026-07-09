import {vsl} from './vessel.js';
import {dist2} from '../lib/math.js';
import {spawnPtc, spawnDrop} from './particles.js';

export function tickMonsters(dt, ents){
for(let i = 0; i < ents.length; i++){
const e = ents[i];
if(e.t !== 'mon' || e.hp <= 0)
continue;
const dx = vsl.x - e.x, dy = vsl.y - e.y;
const d = Math.sqrt(dx * dx + dy * dy);
e.state_t -= dt;
if(e.flash > 0)
e.flash -= dt;
const detectRange = e.m_type === 'ambush' ? 250 : 450;

if(d < detectRange && e.state !== 'charge'){
e.state = 'stalk';
e.target_x = vsl.x;
e.target_y = vsl.y;
if(e.m_type === 'ambush' && d < 150){
e.state = 'charge';
e.state_t = 1.5;
 }
}
else if(d < 180 && e.m_type === 'leviathan'){
e.state = 'charge';
e.state_t = 2.5;
}
else if(e.state_t <= 0){
e.state = 'wander';
e.target_x = e.x + (Math.random() - 0.5) * 500;
e.target_y = e.y + (Math.random() - 0.5) * 500;
e.state_t = 3 + Math.random() * 5;
}

let tx = e.target_x - e.x, ty = e.target_y - e.y;
const td = Math.sqrt(tx * tx + ty * ty);
if(td > 1){
tx /= td; ty /= td; 
}

let spd_mult = 1;
if(e.state === 'charge')
spd_mult = 3.5;
else if(e.state === 'stalk')
spd_mult = 1.6;

e.vx += tx * e.spd * spd_mult * dt;
e.vy += ty * e.spd * spd_mult * dt;
const drag = e.state === 'charge' ? 0.98 : 0.94;
e.vx *= drag;
e.vy *= drag;
e.x += e.vx * dt;
e.y += e.vy * dt;

if(Math.abs(e.vx) > 2 || Math.abs(e.vy) > 2){
const target_ang = Math.atan2(e.vy, e.vx);
let diff = target_ang - e.ang;
while(diff > Math.PI)
diff -= Math.PI * 2;
while(diff < -Math.PI)
diff += Math.PI * 2;
e.ang += diff * 0.1;
 }
  }
}

export function drawMonster(cx, e){
if(e.hp <= 0)
return;

cx.save();
cx.translate(e.x, e.y);
cx.rotate(e.ang);

if(e.flash > 0){
cx.fillStyle = '#fff';
}
else if(e.m_type === 'leviathan'){
cx.fillStyle = '#5a1a2a';
}
else if(e.m_type === 'jelly'){
cx.fillStyle = '#6a2a7a';
}
else if(e.m_type === 'ambush'){
cx.fillStyle = '#1a3a3a';
}
else{
cx.fillStyle = '#2a5a6a';
}

cx.strokeStyle = '#0a0a0a';
cx.lineWidth = 2;
const t = performance.now() * 0.005;

if(e.m_type === 'leviathan'){
cx.beginPath();
cx.ellipse(0, 0, e.r * 1.6, e.r, 0, 0, Math.PI * 2);
cx.fill();
cx.stroke();
cx.fillStyle = '#ff2222';
cx.beginPath();
cx.arc(e.r * 0.9, -e.r * 0.3, 6, 0, Math.PI * 2);
cx.arc(e.r * 0.9, e.r * 0.3, 6, 0, Math.PI * 2);
cx.fill();
cx.strokeStyle = '#3a0a0a';
cx.lineWidth = 3;
for(let i=0; i<3; i++){
cx.beginPath();
cx.moveTo(-e.r * 1.2, (i-1)*15);
cx.quadraticCurveTo(-e.r*1.8, (i-1)*15 + Math.sin(t+i)*10, -e.r*2.2, (i-1)*15);
cx.stroke();
 }
}
else if(e.m_type === 'jelly'){
cx.beginPath();
cx.arc(0, 0, e.r, Math.PI, 0);
cx.quadraticCurveTo(e.r, e.r * 0.6 + Math.sin(t) * 12, 0, e.r * 0.9);
cx.quadraticCurveTo(-e.r, e.r * 0.6 + Math.sin(t + 1) * 12, -e.r, 0);
cx.fill();
cx.stroke();
cx.strokeStyle = 'rgba(220,120,255,0.6)';
cx.lineWidth = 2;
for(let i = -2; i <= 2; i++){
cx.beginPath();
cx.moveTo(i * 12, e.r * 0.6);
cx.quadraticCurveTo(i * 12 + Math.sin(t + i) * 18, e.r * 1.8, i * 12, e.r * 3);
cx.stroke();
 }
}
else if(e.m_type === 'ambush'){
cx.beginPath();
cx.moveTo(e.r * 1.2, 0);
cx.lineTo(-e.r * 0.5, -e.r * 0.8);
cx.lineTo(-e.r * 1.2, 0);
cx.lineTo(-e.r * 0.5, e.r * 0.8);
cx.closePath();
cx.fill();
cx.stroke();
cx.fillStyle = '#ffcc00';
cx.beginPath();
cx.arc(e.r * 0.4, 0, 4, 0, Math.PI * 2);
cx.fill();
}
else{
cx.beginPath();
cx.moveTo(e.r, 0);
cx.quadraticCurveTo(0, -e.r, -e.r, 0);
cx.quadraticCurveTo(-e.r * 1.5, -e.r * 0.5, -e.r * 2, 0);
cx.quadraticCurveTo(-e.r * 1.5, e.r * 0.5, -e.r, 0);
cx.quadraticCurveTo(0, e.r, e.r, 0);
cx.fill();
cx.stroke();
cx.fillStyle = '#ffcc00';
cx.beginPath();
cx.arc(e.r * 0.4, -e.r * 0.2, 3, 0, Math.PI * 2);
cx.fill();
}

cx.restore();
if(e.hp < e.max_hp){
const bw = e.r * 2;
cx.fillStyle = '#300';
cx.fillRect(e.x - bw/2, e.y - e.r - 18, bw, 5);
cx.fillStyle = '#f00';
cx.fillRect(e.x - bw/2, e.y - e.r - 18, bw * (e.hp / e.max_hp), 5);
 }
}

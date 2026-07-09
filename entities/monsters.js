import {vsl} from './vessel.js';
import {spawnPtc} from './particles.js';
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
if(d < 450 && e.state !== 'charge'){
e.state = 'stalk';
e.target_x = vsl.x;
e.target_y = vsl.y;
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
let spd_mult = e.state === 'stalk' ? 1.6 : 1;
e.vx += tx * e.spd * spd_mult * dt;
e.vy += ty * e.spd * spd_mult * dt;
e.vx *= 0.94; e.vy *= 0.94;
e.x += e.vx * dt; e.y += e.vy * dt;

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
cx.fillStyle = e.flash > 0 ? '#fff' : '#2a5a6a';
cx.strokeStyle = '#0a0a0a';
cx.lineWidth = 2;
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
cx.restore();
if(e.hp < e.max_hp){
const bw = e.r * 2;
cx.fillStyle = '#300';
cx.fillRect(e.x - bw/2, e.y - e.r - 18, bw, 5);
cx.fillStyle = '#f00';
cx.fillRect(e.x - bw/2, e.y - e.r - 18, bw * (e.hp / e.max_hp), 5);
 }
}

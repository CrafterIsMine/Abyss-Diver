import {isDown, wasPressed} from '../lib/input.js';
import {spawnPtc} from './particles.js';
import {playBoost} from '../lib/audio.js';

export const vsl={
x: 0, y: 0,
vx: 0, vy: 0,
ang: -Math.PI / 2,
ang_vel: 0,
thrust: 0,
r: 24,
mass: 150,
hp: 100, max_hp: 100,
scrap: 0,
invuln: 0,
boost: 100, max_boost: 100,
boosting: false,
boostCooldown: 0,
upgrades:{
hull: 0,
engine: 0,
ram: 0,
sonar: 0
}
};

export function resetVsl(){
vsl.x = 0; vsl.y = 0;
vsl.vx = 0; vsl.vy = 0;
vsl.ang = -Math.PI / 2;
vsl.ang_vel = 0;
vsl.hp = vsl.max_hp;
vsl.boost = vsl.max_boost;
vsl.invuln = 0;
vsl.boosting = false;
vsl.boostCooldown = 0;
}

export function tickVsl(dt){
const turn_rate = 2.8 + vsl.upgrades.engine * 0.3;
const max_thrust = 450 + vsl.upgrades.engine * 80;
const drag = 0.91;
const ang_drag = 0.82;

if(isDown('KeyA') || isDown('ArrowLeft'))
vsl.ang_vel -= turn_rate * dt;
if(isDown('KeyD') || isDown('ArrowRight'))
vsl.ang_vel += turn_rate * dt;
vsl.ang_vel *= Math.pow(ang_drag, dt * 60);
vsl.ang += vsl.ang_vel * dt;
vsl.thrust = 0;

if(isDown('KeyW') || isDown('ArrowUp'))
vsl.thrust = max_thrust;
if(isDown('KeyS') || isDown('ArrowDown'))
vsl.thrust = -max_thrust * 0.4;
vsl.boosting = false;
if(vsl.boostCooldown > 0)
vsl.boostCooldown -= dt;

if((wasPressed('Space') || isDown('Space')) && vsl.boost >= 30 && vsl.thrust > 0 && vsl.boostCooldown <= 0){
vsl.boosting = true;
vsl.boost -= 30 * dt;
if(wasPressed('Space')){
playBoost();
vsl.boostCooldown = 0.3;
 }
}

if(vsl.boosting){
vsl.thrust *= 2.5;
}

if(!vsl.boosting && vsl.boost < vsl.max_boost){
vsl.boost += 12 * dt;
if(vsl.boost > vsl.max_boost)
vsl.boost = vsl.max_boost;
}

const tx = Math.cos(vsl.ang) * vsl.thrust;
const ty = Math.sin(vsl.ang) * vsl.thrust;
vsl.vx += tx * dt;
vsl.vy += ty * dt;
vsl.vx *= Math.pow(drag, dt * 60);
vsl.vy *= Math.pow(drag, dt * 60);
vsl.x += vsl.vx * dt;
vsl.y += vsl.vy * dt;

if(vsl.invuln > 0)
vsl.invuln -= dt;

const spd = Math.sqrt(vsl.vx * vsl.vx + vsl.vy * vsl.vy);
if(spd > 30 && Math.random() < 0.4){
const bx = vsl.x - Math.cos(vsl.ang) * 22;
const by = vsl.y - Math.sin(vsl.ang) * 22;
const c = vsl.boosting ? 'rgba(100,200,255,0.8)' : 'rgba(150,200,255,0.4)';
spawnPtc(bx, by, -vsl.vx * 0.2 + (Math.random()-0.5)*30, -vsl.vy * 0.2 + (Math.random()-0.5)*30, 1.2, c, vsl.boosting ? 6 : 4);
 }
}

export function drawVsl(cx){
cx.save();
cx.translate(vsl.x, vsl.y);
cx.rotate(vsl.ang);
const spd = Math.sqrt(vsl.vx * vsl.vx + vsl.vy * vsl.vy);
const light_len = 350 + spd * 2.5;
const grad = cx.createRadialGradient(25, 0, 15, 25, 0, light_len);
grad.addColorStop(0, vsl.boosting ? 'rgba(150, 220, 255, 0.5)' : 'rgba(200, 255, 220, 0.3)');
grad.addColorStop(1, 'rgba(200, 255, 220, 0)');
cx.fillStyle = grad;
cx.beginPath();
cx.moveTo(25, 0);
cx.arc(25, 0, light_len, -0.45, 0.45);
cx.closePath();
cx.fill();
const flash = vsl.invuln > 0 && Math.floor(vsl.invuln * 20) % 2;
cx.fillStyle = flash ? '#ff8888' : (vsl.boosting ? '#66aacc' : '#3a5a7a');
cx.strokeStyle = '#1a2a3a';
cx.lineWidth = 3;
cx.beginPath();
cx.moveTo(vsl.r + 4, 0);
cx.lineTo(vsl.r * 0.5, -vsl.r * 0.7);
cx.lineTo(-vsl.r * 0.8, -vsl.r * 0.6);
cx.lineTo(-vsl.r, -vsl.r * 0.3);
cx.lineTo(-vsl.r, vsl.r * 0.3);
cx.lineTo(-vsl.r * 0.8, vsl.r * 0.6);
cx.lineTo(vsl.r * 0.5, vsl.r * 0.7);
cx.closePath();
cx.fill();
cx.stroke();
cx.fillStyle = '#aaddff';
cx.beginPath();
cx.ellipse(vsl.r * 0.3, 0, 8, 5, 0, 0, Math.PI * 2);
cx.fill();
cx.fillStyle = '#111';
cx.fillRect(-vsl.r * 1.15, -vsl.r * 0.35, 5, vsl.r * 0.7);
cx.restore();
}

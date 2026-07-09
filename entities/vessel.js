import {isDown} from '../lib/input.js';
export const vsl={
x: 0, y: 0,
vx: 0, vy: 0,
ang: -Math.PI / 2,
ang_vel: 0,
thrust: 0,
r: 24
};

export function resetVsl(){
vsl.x = 0; vsl.y = 0;
vsl.vx = 0; vsl.vy = 0;
vsl.ang = -Math.PI / 2;
vsl.ang_vel = 0;
}
export function tickVsl(dt){
const turn_rate = 2.8;
const max_thrust = 450;
const drag = 0.91;
const ang_drag = 0.82;

if (isDown('KeyA') || isDown('ArrowLeft'))
vsl.ang_vel -= turn_rate * dt;
if (isDown('KeyD') || isDown('ArrowRight'))
vsl.ang_vel += turn_rate * dt;
vsl.ang_vel *= Math.pow(ang_drag, dt * 60);
vsl.ang += vsl.ang_vel * dt;
vsl.thrust = 0;
if (isDown('KeyW') || isDown('ArrowUp'))
vsl.thrust = max_thrust;
if (isDown('KeyS') || isDown('ArrowDown'))
vsl.thrust = -max_thrust * 0.4;
const tx = Math.cos(vsl.ang) * vsl.thrust;
const ty = Math.sin(vsl.ang) * vsl.thrust;
vsl.vx += tx * dt;
vsl.vy += ty * dt;
vsl.vx *= Math.pow(drag, dt * 60);
vsl.vy *= Math.pow(drag, dt * 60);
vsl.x += vsl.vx * dt;
vsl.y += vsl.vy * dt;
}

export function drawVsl(cx){
cx.save();
cx.translate(vsl.x, vsl.y);
cx.rotate(vsl.ang);
cx.fillStyle = '#3a5a7a';
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
cx.restore();
}

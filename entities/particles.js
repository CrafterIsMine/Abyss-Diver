const ptcPool = [];
const ptcActive = [];
export function spawnPtc(x, y, vx, vy, life, col, sz){
let p = ptcPool.pop();
if(!p) p ={
};
p.x = x; p.y = y; p.vx = vx; p.vy = vy;
p.life = life; p.max_life = life;
p.col = col; p.sz = sz;
ptcActive.push(p);
}
export function tickPtc(dt){
for(let i = ptcActive.length - 1; i >= 0; i--){
const p = ptcActive[i];
p.x += p.vx * dt;
p.y += p.vy * dt;
p.vx *= 0.97;
p.vy *= 0.97;
p.life -= dt;
if(p.life <= 0){
ptcPool.push(p);
ptcActive.splice(i, 1);
  }
 }
}

export function drawPtc(cx){
for(let i = 0; i < ptcActive.length; i++){
const p = ptcActive[i];
const alpha = p.life / p.max_life;
cx.globalAlpha = alpha;
cx.fillStyle = p.col;
cx.beginPath();
cx.arc(p.x, p.y, p.sz * alpha, 0, Math.PI * 2);
cx.fill();
}
cx.globalAlpha = 1;
}

const drops = [];

export function spawnDrop(x, y, val){
drops.push({
x, y,
vx: (Math.random() - 0.5) * 120,
vy: (Math.random() - 0.5) * 120,
val,
life: 20,
r: 10,
ang: Math.random() * Math.PI * 2
 });
}

export function tickDrops(dt, vsl){
for(let i = drops.length - 1; i >= 0; i--){
const d = drops[i];
d.x += d.vx * dt;
d.y += d.vy * dt;
d.vx *= 0.94;
d.vy *= 0.94;
d.ang += dt * 2;
d.life -= dt;
const dx = d.x - vsl.x, dy = d.y - vsl.y;
const dist = Math.sqrt(dx * dx + dy * dy);
if(dist < 100){
const pull = 400 / Math.max(dist, 1);
d.vx -= (dx / dist) * pull;
d.vy -= (dy / dist) * pull;
}

if(dist < vsl.r + d.r){
vsl.scrap += d.val;
for(let j = 0; j < 6; j++){
spawnPtc(d.x, d.y, (Math.random()-0.5)*150, (Math.random()-0.5)*150, 0.6, '#ffcc00', 4);
}
drops.splice(i, 1);
continue;
}

if(d.life <= 0)
drops.splice(i, 1);
 } 
}
export function drawDrops(cx){
for(let i = 0; i < drops.length; i++){
const d = drops[i];
cx.save();
cx.translate(d.x, d.y);
cx.rotate(d.ang);
cx.fillStyle = '#ffcc00';
cx.strokeStyle = '#aa8800';
cx.lineWidth = 2;
cx.beginPath();
cx.moveTo(0, -d.r);
cx.lineTo(d.r, 0);
cx.lineTo(0, d.r);
cx.lineTo(-d.r, 0);
cx.closePath();
cx.fill();
cx.stroke();
cx.restore();
 }
}
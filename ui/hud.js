import {vsl} from '../entities/vessel.js';
import {activeEnts} from '../world/chunks.js';

const hullFill = document.getElementById('hull_fill');
const hullTxt = document.getElementById('hull_txt');
const spdTxt = document.getElementById('spd_txt');
const dptTxt = document.getElementById('dpt_txt');
const scrapTxt = document.getElementById('scrap_txt');
const boostFill = document.getElementById('boost_fill');
const snrCv = document.getElementById('snr_cv');
const snrCx = snrCv.getContext('2d');

export function updateHud(){
const dist = Math.sqrt(vsl.x * vsl.x + vsl.y * vsl.y);
const depth = Math.floor(dist * 0.5);
const spd = Math.floor(Math.sqrt(vsl.vx * vsl.vx + vsl.vy * vsl.vy) * 0.12);
hullFill.style.width = Math.max(0, (vsl.hp / vsl.max_hp) * 100) + '%';
hullTxt.textContent = Math.max(0, Math.floor(vsl.hp));
spdTxt.textContent = spd + ' kn';
dptTxt.textContent = depth + ' m';
scrapTxt.textContent = 'Scrap: ' + vsl.scrap;
boostFill.style.width = (vsl.boost / vsl.max_boost) * 100 + '%';
}

export function drawSonar(){
snrCx.fillStyle = 'rgba(0, 10, 5, 0.35)';
snrCx.fillRect(0, 0, 180, 180);
snrCx.strokeStyle = '#1a4433';
snrCx.lineWidth = 1;
snrCx.beginPath();
snrCx.arc(90, 90, 45, 0, Math.PI * 2);
snrCx.stroke();
snrCx.beginPath();
snrCx.arc(90, 90, 80, 0, Math.PI * 2);
snrCx.stroke();
snrCx.beginPath();
snrCx.moveTo(90, 10); snrCx.lineTo(90, 170);
snrCx.moveTo(10, 90); snrCx.lineTo(170, 90);
snrCx.stroke();
const snrRad = 80;
const sonarRange = 1200 + vsl.upgrades.sonar * 400;
const t = performance.now() * 0.001;
const sweepAng = t % (Math.PI * 2);
const grad = snrCx.createConicGradient(sweepAng - Math.PI / 2, 90, 90);
grad.addColorStop(0, 'rgba(50, 255, 100, 0.5)');
grad.addColorStop(0.1, 'rgba(50, 255, 100, 0)');
grad.addColorStop(1, 'rgba(50, 255, 100, 0)');
snrCx.fillStyle = grad;
snrCx.beginPath();
snrCx.arc(90, 90, snrRad, 0, Math.PI * 2);
snrCx.fill();

for(let i = 0; i < activeEnts.length; i++){
const e = activeEnts[i];
if(e.t !== 'mon' || e.hp <= 0)
continue;
const dx = e.x - vsl.x, dy = e.y - vsl.y;
const d = Math.sqrt(dx * dx + dy * dy);
if(d < sonarRange){
const sx = 90 + (dx / sonarRange) * snrRad;
const sy = 90 + (dy / sonarRange) * snrRad;
snrCx.fillStyle = e.m_type === 'leviathan' ? '#ff3333' : (e.m_type === 'ambush' ? '#ffaa00' : '#ffcc00');
snrCx.beginPath();
snrCx.arc(sx, sy, 3, 0, Math.PI * 2);
snrCx.fill();
 }
}
snrCx.fillStyle = '#33ff66';
snrCx.beginPath();
snrCx.arc(90, 90, 4, 0, Math.PI * 2);
snrCx.fill();
}

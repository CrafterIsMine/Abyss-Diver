import {mulb32, hash2, noise2d, fbm} from '../lib/math.js';
import {getChunkSize} from './chunks.js';

export function genChunkContents(cx, cy){
const CHNK_SZ = getChunkSize();
const rng = mulb32(hash2(cx, cy));
const ents = [];
const wx = cx * CHNK_SZ, wy = cy * CHNK_SZ;
const dist = Math.sqrt(wx * wx + wy * wy);
const danger_lvl = Math.min(1, dist / 10000);

const num_vents = Math.floor(rng() * 3 * (1 - danger_lvl));
for(let i = 0; i < num_vents; i++){
ents.push({
t: 'vent',
x: wx + rng() * CHNK_SZ,
y: wy + rng() * CHNK_SZ,
r: 40 + rng() * 40,
phase: rng() * Math.PI * 2
 });
}
const num_rocks = Math.floor(rng() * 6 + danger_lvl * 12);
for(let i = 0; i < num_rocks; i++){
const verts = Math.floor(rng() * 5) + 5;
const vertData = [];
for(let v = 0; v < verts; v++){
vertData.push(0.7 + rng() * 0.6);
}
ents.push({
t: 'rock',
x: wx + rng() * CHNK_SZ,
y: wy + rng() * CHNK_SZ,
r: 25 + rng() * 70,
ang: rng() * Math.PI * 2,
verts: vertData
 });
}
const num_kelp = Math.floor(rng() * 10);
for(let i = 0; i < num_kelp; i++){
const kx = wx + rng() * CHNK_SZ;
const ky = wy + rng() * CHNK_SZ;
const segs = [];
let sx = kx, sy = ky;
const seg_count = 6 + Math.floor(rng() * 12);
for(let j = 0; j < seg_count; j++){
segs.push({ x: sx, y: sy });
sx += (rng() - 0.5) * 25;
sy -= 15 + rng() * 12;
 }
ents.push({ t: 'kelp', segs, phase: rng() * Math.PI * 2 });
}

const num_mon = Math.floor(rng() * 3 + danger_lvl * 8);
for(let i = 0; i < num_mon; i++){
const mx = wx + rng() * CHNK_SZ;
const my = wy + rng() * CHNK_SZ;
const type_roll = rng();
let m_type = 'swimmer';
let m_hp = 30, m_mass = 50, m_r = 25, m_spd = 130;

if(type_roll > 0.85 && danger_lvl > 0.2){
m_type = 'leviathan';
m_hp = 250 + danger_lvl * 400;
m_mass = 500;
m_r = 65;
m_spd = 70;
}
else if(type_roll > 0.6){
m_type = 'jelly';
m_hp = 60 + danger_lvl * 80;
m_mass = 30;
m_r = 35;
m_spd = 45;
}
else if(type_roll > 0.3 && danger_lvl > 0.4){
m_type = 'ambush';
m_hp = 100 + danger_lvl * 150;
m_mass = 120;
m_r = 40;
m_spd = 200;
}

ents.push({
t: 'mon',
m_type,
x: mx, y: my,
vx: 0, vy: 0,
ang: rng() * Math.PI * 2,
r: m_r,
hp: m_hp, max_hp: m_hp,
mass: m_mass,
spd: m_spd,
state: 'wander',
state_t: 0,
target_x: mx, target_y: my,
flash: 0,
phase: rng() * Math.PI * 2
 });
}
return ents;
}
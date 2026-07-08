export function mulb32(a){
return function(){
a |= 0; a = a + 0x6D2B79F5 | 0;
let t = Math.imul(a ^ a >>> 15, 1 | a);
t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
return ((t ^ t >>> 14) >>> 0) / 4294967296;
 }
}

export function hash2(x, y){
let h = x * 374761393 + y * 668265263;
h = (h ^ (h >> 13)) * 1274126177;
return (h ^ (h >> 16)) >>> 0;
}

export function noise2d(x, y){
const xi = Math.floor(x), yi = Math.floor(y);
const xf = x - xi, yf = y - yi;
const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);

const n00 = (hash2(xi, yi) & 0xffff) / 0xffff;
const n10 = (hash2(xi + 1, yi) & 0xffff) / 0xffff;
const n01 = (hash2(xi, yi + 1) & 0xffff) / 0xffff;
const n11 = (hash2(xi + 1, yi + 1) & 0xffff) / 0xffff;

const nx0 = n00 * (1 - u) + n10 * u;
const nx1 = n01 * (1 - u) + n11 * u;
return nx0 * (1 - v) + nx1 * v;
}

export function fbm(x, y, oct){
let val = 0, amp = 0.5, freq = 1;
for(let i = 0; i < oct; i++){
val += amp * noise2d(x * freq, y * freq);
amp *= 0.5;
freq *= 2;
 }
return val;
}

export function dist2(x1, y1, x2, y2){
const dx = x2 - x1, dy = y2 - y1;
return dx * dx + dy * dy;
}

export function lerp(a, b, t){
return a + (b - a) * t;
}

export function clamp(v, mn, mx){
return v < mn ? mn : (v > mx ? mx : v);
}
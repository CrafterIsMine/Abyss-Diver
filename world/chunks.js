import {hash2} from '../lib/math.js';

const CHNK_SZ = 1024;
const chnkMap = new Map();
export const activeEnts = [];

function chnkKey(cx, cy){
return cx + ',' + cy; 
}

export function getChunk(cx, cy){
const k = chnkKey(cx, cy);
return chnkMap.get(k);
}

export function setChunk(cx, cy, ents){
chnkMap.set(chnkKey(cx, cy), ents);
}

export function updateChunks(px, py, genFunc){
const pcx = Math.floor(px / CHNK_SZ);
const pcy = Math.floor(py / CHNK_SZ);
const rad = 2;

const needed = new Set();
for(let dx = -rad; dx <= rad; dx++){
for(let dy = -rad; dy <= rad; dy++){
const k = chnkKey(pcx + dx, pcy + dy);
needed.add(k);
if(!chnkMap.has(k)){
const ents = genFunc(pcx + dx, pcy + dy);
chnkMap.set(k, ents);
 }
  }
}

for(const k of chnkMap.keys()){
if (!needed.has(k)) chnkMap.delete(k);
}

activeEnts.length = 0;
for(const ents of chnkMap.values()){
for(let i = 0; i < ents.length; i++){
activeEnts.push(ents[i]);
}
 }
}

export function getChunkSize(){
return CHNK_SZ; 
}

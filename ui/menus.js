import {vsl, resetVsl} from '../entities/vessel.js';
import {initAudio} from '../lib/audio.js';
const menuLayer = document.getElementById('menu_layer');
const hudLayer = document.getElementById('hud_layer');
const titleScr = document.getElementById('title_scr');
const deathScr = document.getElementById('death_scr');
const upgradeScr = document.getElementById('upgrade_scr');
const startBtn = document.getElementById('start_btn');
const retryBtn = document.getElementById('retry_btn');
const closeUpgBtn = document.getElementById('close_upg_btn');
const deathStats = document.getElementById('death_stats');
const upgList = document.getElementById('upg_list');
export const gameState={
val:'menu' 
};

function hideAll(){
titleScr.classList.add('hidden');
deathScr.classList.add('hidden');
upgradeScr.classList.add('hidden');
}
function showMenu(){
menuLayer.classList.add('active');
hudLayer.classList.remove('active');
}
function showGame(){
menuLayer.classList.remove('active');
hudLayer.classList.add('active');
}

startBtn.addEventListener('click', ()=>{
initAudio();
hideAll();
showGame();
resetVsl();
vsl.scrap = 0;
vsl.upgrades = { hull: 0, engine: 0, ram: 0, sonar: 0 };
vsl.max_hp = 100;
vsl.hp = 100;
gameState.val = 'playing';
});

retryBtn.addEventListener('click', ()=>{
hideAll();
upgradeScr.classList.remove('hidden');
renderUpgrades();
gameState.val = 'upgrading';
});

closeUpgBtn.addEventListener('click', ()=>{
hideAll();
showGame();
resetVsl();
gameState.val = 'playing';
});

export function triggerDeath(){
gameState.val = 'dead';
const dist = Math.sqrt(vsl.x * vsl.x + vsl.y * vsl.y);
const depth = Math.floor(dist * 0.5);
deathStats.textContent = `Max Depth: ${depth}m | Scrap Collected: ${vsl.scrap}`;
hideAll();
deathScr.classList.remove('hidden');
showMenu();
}

function renderUpgrades(){
upgList.innerHTML = '';
const types =[
{ key: 'hull', name: 'Hull Plating', desc: '+50 Max HP', cost: 50 },
{ key: 'engine', name: 'Thrusters', desc: '+Speed & Turn', cost: 75 },
{ key: 'ram', name: 'Reinforced Tackle', desc: '+Impact Dmg', cost: 100 },
{ key: 'sonar', name: 'Sonar Array', desc: '+Scan Range', cost: 60 }
];

for(const u of types){
const lvl = vsl.upgrades[u.key];
const cost = u.cost + lvl * 40;
const row = document.createElement('div');
row.className = 'upg_row';
row.innerHTML = `
<span>${u.name} (Lv ${lvl})</span>
<span>${u.desc}</span>
<button ${vsl.scrap < cost ? 'disabled' : ''}>${cost} Scrap</button>`;
const btn = row.querySelector('button');
btn.addEventListener('click', ()=>{
if(vsl.scrap >= cost){
vsl.scrap -= cost;
vsl.upgrades[u.key]++;
if(u.key === 'hull'){
vsl.max_hp += 50;
vsl.hp = vsl.max_hp;
}
renderUpgrades();
 }
});
upgList.appendChild(row);
  }
}
let actx = null;
export function initAudio(){
if(!actx){
actx = new (window.AudioContext || window.webkitAudioContext)();
}
if(actx.state === 'suspended'){
actx.resume();
 }
}

function playTone(freq, dur, type, vol, delay){
if(!actx)
return;
const t = actx.currentTime + (delay || 0);
const osc = actx.createOscillator();
const gain = actx.createGain();
osc.type = type;
osc.frequency.setValueAtTime(freq, t);
gain.gain.setValueAtTime(0, t);
gain.gain.linearRampToValueAtTime(vol, t + 0.01);
gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
osc.connect(gain);
gain.connect(actx.destination);
osc.start(t);
osc.stop(t + dur);
}

function playNoise(dur, vol){
if(!actx)
return;
const bufferSize = actx.sampleRate * dur;
const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
const data = buffer.getChannelData(0);
for(let i = 0; i < bufferSize; i++){
data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
}
const source = actx.createBufferSource();
source.buffer = buffer;
const gain = actx.createGain();
gain.gain.value = vol;
source.connect(gain);
gain.connect(actx.destination);
source.start();
}

export function playHit(impact){
const f = 80 + Math.min(impact * 0.3, 200);
playTone(f, 0.15, 'square', 0.12);
playTone(f * 0.5, 0.25, 'sawtooth', 0.08);
playNoise(0.08, 0.06);
}

export function playPing(){
playTone(800, 0.08, 'sine', 0.04);
playTone(600, 0.12, 'sine', 0.03, 0.08);
}

export function playBoost(){
playTone(150, 0.3, 'sawtooth', 0.08);
playTone(200, 0.25, 'square', 0.06, 0.05);
playNoise(0.2, 0.04);
}

export function playBreak(){
playTone(60, 0.8, 'sawtooth', 0.15);
playTone(40, 1.2, 'square', 0.12, 0.1);
playNoise(0.5, 0.1);
playTone(30, 1.5, 'triangle', 0.08, 0.2);
}

export function playCollect(){
playTone(400, 0.05, 'sine', 0.04);
playTone(600, 0.08, 'sine', 0.03, 0.05);
}
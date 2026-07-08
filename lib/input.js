const kds = {};
const kdp = {};

window.addEventListener('keydown', e =>{
if(!kds[e.code])
kdp[e.code] = true;
kds[e.code] = true;
});

window.addEventListener('keyup', e =>{
kds[e.code] = false;
});

export function isDown(code){
return !!kds[code];
}

export function wasPressed(code){
return !!kdp[code];
}

export function clearPressed(){
for(const k in kdp)
kdp[k] = false;
}

import './style.css'
import * as THREE from 'three'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { Vector3 } from 'three';

const canvas = document.querySelector('canvas.webgl')

const pointerLock = document.querySelector('#pointer-lock')
pointerLock.height = window.innerHeight;
pointerLock.src = './assets/images/SplashScreen.png'

const stats = document.querySelector('#stats')
const popup = document.querySelector('#popup')
const inventory = document.querySelector('#inventory')
const icon = document.querySelector('#icon')
const comms = document.querySelector('#comms')
const healthAmmo = document.querySelector('#health-ammo')
const cockpitL = document.querySelector('#cockpitL')
const cockpitR = document.querySelector('#cockpitR')
const gunhand = document.querySelector('#gunhand')
const youDied = document.querySelector('#you-died')

const scene = new THREE.Scene()

//global array instantiations
let monsters = []
let debris = []
let sprites = []
let powerups = []

//#region [rgba(0, 126, 255, 0.15) ] PURE UTILITY
/*  
* This section has NPC and STORY info
*/

function randBetween(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

let VECTOR_ZERO = new Vector3(0,0,0);

//#endregion

// ----------------------------SET-------------------------------- //

//#region [rgba(255, 25, 25, 0.15) ] STORY
/*  
* This section has NPC and STORY info
*/
const NAMES = ["Adam", "Alex", "Aaron", "Ben", "Carl", "Dan", "David", "Edward", "Fred", "Frank", "George", "Hal", "Hank", "Ike", "John", "Jack", "Joe",
    "Larry", "Monte", "Matthew", "Mark", "Nathan", "Otto", "Paul", "Peter", "Roger", "Roger", "Steve", "Thomas", "Tim", "Ty", "Victor", "Walter", "Zeke"]

//105 syllables, 5460 combinations at 2 sylls, 187,460 at 3 sylls, 4,780,230 at 4 sylls.
var SYLLABLES = [] 
const VOWELS = "aeiou".split('')
const CONSONANTS = "bcdfghjklmnpqrstvwxyz".split('')
for (let i = 0; i < CONSONANTS.length; i++) {
    for (let j = 0; j < VOWELS.length; j++) {
        SYLLABLES.push(CONSONANTS[i] + VOWELS[j])
    }
}
function getAbjadWord(syllables) {
    var tempString = ""
    for (let i = 0; i < syllables; i++) {
        tempString += SYLLABLES[Math.floor((Math.random() * SYLLABLES.length) + 1)]
    }
    return tempString;
}
function getName() {
    return NAMES[Math.floor((Math.random() * NAMES.length) + 1)];
}
const story = [
    "You'll be able to carry yourself through ego death.",
    "Sounds contradictory? It's not really a well named concept.",
    "Pass through the dark eye at the center of the universe...",
    "Give birth to yourself from the inky blackness and be torn apart by the light.",
    "Feel the membrane on the periphery of the experience. We're not sure what it is except to say, it's you."
]
//#endregion

//#region [rgba(25, 255, 25, 0.15) ] MATERIALS
/*  
* This section sets up a map for basic color materials, as well as a few textured materials.
*/
const loader = new THREE.TextureLoader();
loader.crossOrigin = '';

//Basic Color Materials
const mGrey = new THREE.MeshBasicMaterial({color: new THREE.Color('grey')})

//Gun "Sprites" - really images
let gunSpriteURLS = ['./assets/images/pistol_1.png']

//Monster Sprites
let monsterSpriteMaterials = new Map()
let monsterSpriteURLS = ['monster']
for (let i = 0; i < monsterSpriteURLS.length; i++) {
    var tempMap = new THREE.TextureLoader().load(`assets/images/${monsterSpriteURLS[i]}.png`);
    tempMap.magFilter = THREE.NearestFilter;
    tempMap.minFilter = THREE.LinearMipMapLinearFilter;
    var tempMat = new THREE.SpriteMaterial({ map: tempMap });
    monsterSpriteMaterials.set(monsterSpriteURLS[i], tempMat);
}

//Powerup Sprites
let powerupSpriteMaterials = new Map()
let powerupSpriteURLS = ['ammo']
for (let i = 0; i < powerupSpriteURLS.length; i++) {
    var tempMap = new THREE.TextureLoader().load(`assets/images/${powerupSpriteURLS[i]}.png`);
    tempMap.magFilter = THREE.NearestFilter;
    tempMap.minFilter = THREE.LinearMipMapLinearFilter;
    var tempMat = new THREE.SpriteMaterial({ map: tempMap });
    powerupSpriteMaterials.set(powerupSpriteURLS[i], tempMat);
}

//Effect Sprites
let effectSpriteMaterials = new Map()
let effectSpriteURLS = ['blood1']
for (let i = 0; i < effectSpriteURLS.length; i++) {
    var tempMap = new THREE.TextureLoader().load(`assets/images/${effectSpriteURLS[i]}.png`);
    tempMap.magFilter = THREE.NearestFilter;
    tempMap.minFilter = THREE.LinearMipMapLinearFilter;
    var tempMat = new THREE.SpriteMaterial({ map: tempMap });
    effectSpriteMaterials.set(effectSpriteURLS[i], tempMat);
}

//#endregion

//#region [rgba(128, 25, 25, 0.15) ] SCENERY
/*  
* This section sets up the objects to display in the scene.
*/

//Add random space debris
for (let i = 0; i < 40; i++) {
    var tempGeo = new THREE.SphereBufferGeometry(randBetween(1,3), )
    var tempDebris = new THREE.Mesh(tempGeo, mGrey)
    tempDebris.position.x = randBetween (-40,40);
    tempDebris.position.y = randBetween (-40,40);
    tempDebris.position.z = randBetween (-40,40);
    tempDebris.velocity = new Vector3(0,0,0)
    debris.push(tempDebris)
    scene.add(tempDebris)
}

//Add light
// let directionalLight = new THREE.AmbientLight(0xffffff, 0.4)
// directionalLight.position.x = 5;
// directionalLight.position.z = 6;
// directionalLight.position.y = 3;
// scene.add(directionalLight)

//Add Fog
// let fog = new THREE.FogExp2(0x000000, 0.02)
// scene.fog = fog;

const cubeLoader = new THREE.CubeTextureLoader();
const texture = cubeLoader.load([
    'assets/images/pos-x.png',
    'assets/images/neg-x.png',
    'assets/images/pos-y.png',
    'assets/images/neg-y.png',
    'assets/images/pos-z.png',
    'assets/images/neg-z.png',
], ()=>{
    scene.background = texture;
}, ()=>{

}, (e)=>{
    console.log(e)
});

//#endregion

//#region [rgba(128, 40, 255, 0.15) ] AUDIO
/*  
* This section sets up audios to play
*/

const gunshot = new Audio('./assets/audios/gunshot_short.mp3')
const gunclick = new Audio('./assets/audios/gunclick.mp3')
const ricochet = new Audio('./assets/audios/ricochet.mp3')
const bkgMusic = new Audio('./assets/audios/Flossed In Paradise - In The No.mp3')
gunshot.volume = 0.25;
gunclick.volume = 0.25;
ricochet.volume = 0.3
bkgMusic.volume = 0.1;

//#endregion

// ----------------------------MVC-------------------------------- //

//#region [rgba(25, 25, 128, 0.15) ] CONTROLS (CONTROLLER)
/*  
* This section sets up the controls.
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Camera Built-in Properties
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
const controls = new PointerLockControls(camera, document.body);
camera.position.x = 0
camera.position.y = 1.0
camera.position.z = 0
scene.add(camera)

// Camera Custom Properties
camera.forward = new THREE.Vector3(0, 0, -1);
camera.left = new THREE.Vector3(1, 0, 0)
camera.up = new THREE.Vector3(0,1,0);
camera.heightOffset = 1;
camera.health = 100;
camera.canMove = false;
camera.currentChunk = 'Unknown'
camera.currentTile = 0
camera.currentGun = 0
camera.guns = [
    { name: 'pistol', damage: 5, roundsChambered: 6, roundsPerReload: 6, roundsTotal: 30, timeLastReloaded: 0, timeLastFired: 0, cooldown: 600 },
    { name: 'shotgun', damage: 10, roundsChambered: 2, roundsPerReload: 2, roundsTotal: 50, timeLastReloaded: 0, timeLastFired: 0, cooldown: 600 },
    { name: 'rocketLauncher', damage: 40, roundsChambered: 1, roundsPerReload: 1, roundsTotal: 4, timeLastReloaded: 0, timeLastFired: 0, cooldown: 600 },
]

camera.velocity = new THREE.Vector3(0,0,0);
camera.acceleration = 0.15;

// Raycaster
const rayCaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();

// Collisioncasters
const fwdCaster = new THREE.Raycaster();
const bckCaster = new THREE.Raycaster();
const lftCaster = new THREE.Raycaster();
const rigCaster = new THREE.Raycaster();

fwdCaster.camera = camera;
fwdCaster.ray.origin = new Vector3(0,1,0)
fwdCaster.ray.direction = new Vector3(0,1,-1)

bckCaster.camera = camera;
bckCaster.ray.origin = new Vector3(0,1,0)
bckCaster.ray.direction = new Vector3(0,1,1)

lftCaster.camera = camera;
lftCaster.ray.origin = new Vector3(0,1,0)
lftCaster.ray.direction = new Vector3(1,1,0)

rigCaster.camera = camera;
rigCaster.ray.origin = new Vector3(0,1,0)
rigCaster.ray.direction = new Vector3(-1,1,0)

// Control Properties
let W_PRESSED = false;
let S_PRESSED = false;
let A_PRESSED = false;
let D_PRESSED = false;
let E_PRESSED = false;
let R_PRESSED = false;
let SPACE_PRESSED = false;
window.addEventListener('keydown', (e) => {
    if (e.key == 'w') {
        W_PRESSED = true;
    } else if (e.key == 's') {
        S_PRESSED = true;
    } else if (e.key == 'a') {
        A_PRESSED = true;
    } else if (e.key == 'd') {
        D_PRESSED = true;
    } else if (e.key == " ") {
        SPACE_PRESSED = true;
    } else if (e.key == "x") {
        X_PRESSED = true;
    } else if (e.key == "r") {
        R_PRESSED = true;
    } else {
        //console.log('pressed ' + e.key)
    }
})
window.addEventListener('keyup', (e) => {
    if (e.key == 'w') {
        W_PRESSED = false;
    } else if (e.key == 's') {
        S_PRESSED = false;
    } else if (e.key == 'a') {
        A_PRESSED = false;
    } else if (e.key == 'd') {
        D_PRESSED = false;
    } else if (e.key == " ") {
        SPACE_PRESSED = false;
    } else if (e.key == "x") {
        X_PRESSED = false;
    } else if (e.key == "r") {
        R_PRESSED = false;
    }
})
window.addEventListener('keypress', (e) => {
    if (e.key == 'e') {
        if (camera.canMove) {
            rayCaster.setFromCamera(mousePosition, camera);
            const intersects = rayCaster.intersectObjects(scene.children);
            if (intersects[0]) {
                if (intersects[0].object.flavor == "button" && intersects[0].distance < .8) {
                    //console.log(intersects[0])
                    intersects[0].object.callback()
                }
            }
        }
    } else if (e.key == 'i') {
        if (inventory.className == 'inventory') {
            inventory.className = 'hidden'
        } else {
            inventory.className = 'inventory'
        }
    } else if (e.key == '1') {
        camera.currentGun = 0
    } else if (e.key == '2') {
        camera.currentGun = 1
    } else if (e.key == '3') {
        camera.currentGun = 2
    }
})
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
document.body.addEventListener('click', () => {
    if (camera.canMove && Date.now() > camera.guns[camera.currentGun].timeLastFired + camera.guns[camera.currentGun].cooldown) {
        if (camera.guns[camera.currentGun].roundsChambered > 0) {   
            gunshot.play()
            camera.guns[camera.currentGun].roundsChambered--;
            camera.guns[camera.currentGun].timeLastFired = Date.now()
            gunhand.classList.add('fire-animation')
            setTimeout(()=>{gunhand.classList.remove('fire-animation')}, 250)
            var arrow = new THREE.ArrowHelper( camera.getWorldDirection(camera.forward), camera.getWorldPosition(camera.position), 100, 0xffffff );
            arrow.cone.visible = false;
            arrow.line.scale.x = 5
            console.log(arrow)
            scene.add( arrow );
            rayCaster.setFromCamera(mousePosition, camera);
            const intersects = rayCaster.intersectObjects(scene.children);
            //console.log(intersects)
            if (intersects[0]) {
                if (intersects[0].object.type == "Sprite") {
                    console.log(intersects[0])
                    intersects[0].object.health -= camera.guns[camera.currentGun].damage;
                    var blood = createEffectSprite('blood1', intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)
                    sprites.push(blood)
                    scene.add(blood);
                } else if (intersects[0].object.type == "Mesh") {
                    ricochet.play()
                } else {
                    console.log(intersects[0])
                }
            }
        } else {
            gunclick.play()
        }
    }
})
pointerLock.addEventListener('click', () => {
    controls.lock()
    //bkgMusic.play()
})
controls.addEventListener('lock', function () {
    pointerLock.style.display = 'none';
    camera.canMove = true;
});
controls.addEventListener('unlock', function () {
    pointerLock.style.display = 'block';
    camera.canMove = false;
});

// This is a pseudo-Model class, in that it is called every frame.
var ALLOW_FWD = true;
var ALLOW_BACK = true;
var ALLOW_LEFT = true;
var ALLOW_RIGHT = true;
let BARRIER_DISTANCE = 4;
function acceptPlayerInputs() {

    if (camera.health <= 0) {
        camera.canMove = false;
        canvas.classList.add('dead')
        youDied.classList.add('died')
    }

    camera.getWorldDirection(camera.forward)
    camera.getWorldDirection(camera.left);
    camera.left.applyAxisAngle(camera.up, Math.PI / 2)
    ALLOW_FWD = true;
    ALLOW_BACK = true;
    ALLOW_LEFT = true;
    ALLOW_RIGHT = true;
    // //Determine forward collision objects
    fwdCaster.set(camera.position, camera.forward);
    var fwdIntersects = fwdCaster.intersectObjects(scene.children);
    if (fwdIntersects.length > 0) {
        if (fwdIntersects[0].distance < BARRIER_DISTANCE) {
            fwdIntersects[0].object.velocity = camera.velocity
            ALLOW_FWD = false;
        }
    }
    // //Determine backward collision objects
    bckCaster.set(camera.position, new Vector3(-camera.forward.x, camera.forward.y, -camera.forward.z));
    var bckIntersects = bckCaster.intersectObjects(scene.children);
    if (bckIntersects.length > 0) {
        if (bckIntersects[0].distance < BARRIER_DISTANCE) {
            ALLOW_BACK = false;
        }
    }
    // //Determine backward collision objects
    lftCaster.set(camera.position, camera.left);
    var lftIntersects = lftCaster.intersectObjects(scene.children);
    if (lftIntersects.length > 0) {
        if (lftIntersects[0].distance < BARRIER_DISTANCE) {
            ALLOW_LEFT = false;
        }
    }
    // //Determine backward collision objects
    rigCaster.set(camera.position, new Vector3(-camera.left.x, camera.left.y, -camera.left.z));
    var rigIntersects = rigCaster.intersectObjects(scene.children);
    if (rigIntersects.length > 0) {
        if (rigIntersects[0].distance < BARRIER_DISTANCE) {
            ALLOW_RIGHT = false;
        }
    }

    if (camera.canMove) {
        if (W_PRESSED && ALLOW_FWD) {
            camera.velocity = new Vector3(camera.velocity.x, camera.velocity.y, camera.velocity.z).lerp(camera.forward, camera.acceleration)
        }
        if (S_PRESSED && ALLOW_BACK) {
            camera.velocity = new Vector3(camera.velocity.x, camera.velocity.y, camera.velocity.z).lerp(new Vector3(-camera.forward.x, -camera.forward.y, -camera.forward.z), camera.acceleration)
        }
        if (A_PRESSED && ALLOW_LEFT) {
            camera.velocity = new Vector3(camera.velocity.x, camera.velocity.y, camera.velocity.z).lerp(camera.left, camera.acceleration)
        }
        if (D_PRESSED && ALLOW_RIGHT) {
            camera.velocity = new Vector3(camera.velocity.x, camera.velocity.y, camera.velocity.z).lerp(new Vector3(-camera.left.x, -camera.left.y, -camera.left.z), camera.acceleration) ;
        }
        if (SPACE_PRESSED) {
            camera.velocity = new Vector3(camera.velocity.x, camera.velocity.y, camera.velocity.z).lerp(VECTOR_ZERO, camera.acceleration) ;

        }
        if (E_PRESSED) {
            console.log('interact')
        }
        if (R_PRESSED
            && camera.guns[camera.currentGun].roundsChambered == 0
            && camera.guns[camera.currentGun].roundsTotal > 0
            && Date.now() > camera.guns[camera.currentGun].timeLastReloaded + camera.guns[camera.currentGun].cooldown) {

            gunhand.classList.add('reload-animation');
            setTimeout(()=>{gunhand.classList.remove('reload-animation')}, 1000)

            camera.guns[camera.currentGun].timeLastReloaded = Date.now()
            camera.guns[camera.currentGun].roundsChambered += camera.guns[camera.currentGun].roundsPerReload;
            camera.guns[camera.currentGun].roundsTotal -= camera.guns[camera.currentGun].roundsPerReload;
        }
    }
}
//#endregion

//#region [rgba(128, 25, 128, 0.15) ] GAME OBJECTS
/*  
* This section sets up the camera and player.
*/
function createCreatureSprite(name, x, y, z) {
    var tempSprite = new THREE.Sprite(monsterSpriteMaterials.get(name));
    tempSprite.rayCaster = new THREE.Raycaster(new Vector3(x,y,z), new Vector3(x, y, z - 1));
    tempSprite.rayCaster.camera = new THREE.PerspectiveCamera();
    tempSprite.position.x = x;
    tempSprite.position.y = y;
    tempSprite.position.z = z;
    tempSprite.scale.set(1.2, 1.2)
    tempSprite.name = getName()
    tempSprite.health = 20
    tempSprite.status = "idle"
    return tempSprite;
}
function createEffectSprite(name, x, y, z) {
    var tempSprite = new THREE.Sprite(effectSpriteMaterials.get(name));
    var tempSprite = new THREE.Sprite(tempMat);
    tempSprite.position.x = x;
    tempSprite.position.y = y;
    tempSprite.position.z = z;
    tempSprite.timer = 0
    tempSprite.lifeSpan = 20
    return tempSprite;
}
function worldMoves() {

    //Velocity
    camera.position.x += camera.velocity.x;
    camera.position.y += camera.velocity.y;
    camera.position.z += camera.velocity.z;

    for (let i = 0; i < debris.length; i++) {
        debris[i].position.x += debris[i].velocity.x;
        debris[i].position.y += debris[i].velocity.y;
        debris[i].position.z += debris[i].velocity.z;
    }
    
    for (let i = 0; i < sprites.length; i++) {
        sprites[i].timer++;
        if (sprites[i].timer == sprites[i].lifeSpan) {
            scene.remove(sprites[i])
            sprites.splice(i, 1);
        }
    }
}
//#endregion

//#region [rgba(25, 128, 128, 0.15) ] RENDERER (VIEW)
/*  
* This section sets up rendering.
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
//renderer.outputEncoding = THREE.sRGBEncoding;

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)


renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
function generateHUDText(elapsedTime) {
    // //STATS
    stats.innerText = "FPS: " + (1 / (elapsedTime - timeOfLastFrame)).toFixed(0) + "\n"
    stats.innerText += "Position: " + camera.position.x.toFixed(3) + " " + camera.position.y.toFixed(3) + " " + camera.position.z.toFixed(3) + "\n"
    stats.innerText += "Vector Fwd: " + camera.forward.x.toFixed(3) + ", " + camera.forward.y.toFixed(3) + ", " + camera.forward.z.toFixed(3) + "\n"
    stats.innerText += "Velocity: " + camera.velocity.x.toFixed(3) + ", " + camera.velocity.y.toFixed(3) + ", " + camera.velocity.z.toFixed(3) + "\n"
    if (monsters.length > 0) {
        stats.innerText += "First Monster: " + monsters[0].name + " (" + monsters[0].position.x.toFixed(2) + ", " + monsters[0].position.z.toFixed(2) + ") " + monsters[0].status
    }

    // //HEALTH AND AMMO
    healthAmmo.innerText = camera.health + " : " + camera.guns[camera.currentGun].roundsChambered + " / " + camera.guns[camera.currentGun].roundsTotal
}
function generateGunImage() {
    gunhand.src = gunSpriteURLS[camera.currentGun]
    gunhand.width = 400;
}
function generateCockpitImage() {
    cockpitL.src = 'assets/images/cockpitL.png'
    cockpitR.src = 'assets/images/cockpitR.png'
    cockpitL.width = 1400;
    cockpitR.width = 1400;
}
function generateCommsText() {
    if (camera.currentChunk && camera.canMove && Math.abs(camera.position.z) > 5) {
        popup.className = 'popup'
        if (icon) {
            icon.src = './assets/images/npc1.png'
        }
        if (comms) {
            comms.innerText = story[Math.min(Math.abs(camera.currentChunk.z), story.length - 1)];
        }
    } else {
        popup.className = 'hidden'
    }
}
//#endregion

//#region [rgba(128, 128, 128, 0.15) ] GAME LOOP
/*  
* This section sets off the game loop.
*/
const clock = new THREE.Clock()
var timeOfLastFrame = 0
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    //CONTROLLER
    acceptPlayerInputs();

    //MODEL
    worldMoves();

    //VIEW
    composer.render(scene, camera)

    //Call tick again after this
    window.requestAnimationFrame(tick)

    // //Generate Overlay
    generateGunImage();
    generateCockpitImage();
    //generateHUDText(elapsedTime);
    //generateCommsText();

    //This will be a number of milliseconds slower than elapsed time at the beginning of next frame.
    timeOfLastFrame = elapsedTime
}
console.log(sizes)
tick()
//#endregion
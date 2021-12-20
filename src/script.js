import './style.css'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { Vector2, Vector3 } from 'three';

const canvas = document.querySelector('canvas.webgl')
const pointerLock = document.querySelector('#pointer-lock')
pointerLock.height = window.innerHeight;
pointerLock.src = './assets/images/SplashScreen.png'
const youDied = document.querySelector('#you-died')
const stats = document.querySelector('#stats')
const popup = document.querySelector('#popup')
const icon = document.querySelector('#icon')
const comms = document.querySelector('#comms')
const inventory = document.querySelector('#inventory')
const gunhand = document.querySelector('#gunhand')
const healthAmmo = document.querySelector('#health-ammo')
const radar = document.querySelector('#radar')

const scene = new THREE.Scene()

//global instantiations
let paused = true;
let level = 1;
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

function resetLevel() {
    monsters = []
    debris = []
    sprites = []
    powerups = []
    controls.unlock()
    scene.clear()
    scene.background = new THREE.Color('black')
}

let VECTOR_ZERO = new Vector3(0, 0, 0);

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
    return NAMES[Math.floor(Math.random() * NAMES.length)];
}
const story = [
    ["Dispatch:", "We're coming up on a debris field."],
    ["Dispatch:", "Be on the lookout for raiders."],
    ["Malcolm:", "Why do we always use open unencrypted vidcomm?"],
    ["Dispatch:", "We're coming up on a debris field."],
]
//#endregion

//#region [rgba(25, 255, 25, 0.15) ] MATERIALS
/*  
* This section sets up a map for basic color materials, as well as a few textured materials.
*/
//Gun Images
let gunSpriteURLS = ['./assets/images/guns/pistol_1.png']

const loader = new THREE.TextureLoader();
loader.crossOrigin = '';

//Basic Color Materials
const mGrey = new THREE.MeshToonMaterial({ color: new THREE.Color('grey') })
const mPurple = new THREE.MeshToonMaterial({ color: new THREE.Color('purple') })

//Load Picture Materials into the Map
let objMaterials = new Map()
let objURLS = ['spaceDebris1', 'spaceHull', 'ball']
for (let i = 0; i < objURLS.length; i++) {
    var tempMap = new THREE.TextureLoader().load(`assets/models/${objURLS[i]}Diffuse.png`);
    tempMap.magFilter = THREE.NearestFilter;
    tempMap.minFilter = THREE.LinearMipMapLinearFilter;
    var tempMat = new THREE.MeshLambertMaterial({ map: tempMap });
    objMaterials.set(objURLS[i], tempMat);
}

//Monster Sprites
let monsterSpriteMaterials = new Map()
let monsterSpriteURLS = ['enemy1']
for (let i = 0; i < monsterSpriteURLS.length; i++) {
    var tempMap = new THREE.TextureLoader().load(`assets/images/enemies/${monsterSpriteURLS[i]}.png`);
    tempMap.magFilter = THREE.NearestFilter;
    tempMap.minFilter = THREE.LinearMipMapLinearFilter;
    var tempMat = new THREE.SpriteMaterial({ map: tempMap });
    monsterSpriteMaterials.set(monsterSpriteURLS[i], tempMat);
}

//Powerup Sprites
let powerupSpriteMaterials = new Map()
let powerupSpriteURLS = []
for (let i = 0; i < powerupSpriteURLS.length; i++) {
    var tempMap = new THREE.TextureLoader().load(`assets/images/${powerupSpriteURLS[i]}.png`);
    tempMap.magFilter = THREE.NearestFilter;
    tempMap.minFilter = THREE.LinearMipMapLinearFilter;
    var tempMat = new THREE.SpriteMaterial({ map: tempMap });
    powerupSpriteMaterials.set(powerupSpriteURLS[i], tempMat);
}

//Effect Sprites
let effectSpriteMaterials = new Map()
let effectSpriteURLS = ["enemy1"]
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
var objLoader = new OBJLoader();
var objURLs = ['spaceDebris1', 'spaceHull']
function addObjScenery(objName) {
    objLoader.load(`assets/models/${objName}.obj`, function (obj) {
        obj.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = objMaterials.get(objName);
                child.position.x = randBetween(-80, 80)
                child.position.y = randBetween(-80, 80)
                child.position.z = randBetween(-80, 80)
                child.rotation.x = randBetween(-3, 3)
                child.rotation.y = randBetween(-3, 3)
                child.rotation.z = randBetween(-3, 3)
                child.velocity = new Vector3(0,0,0)
                debris.push(child)
                scene.add(child);
            }
        });
    });
}

for (let i = 0; i <= objURLs.length; i++) {
    for (let j = 0; j < 20; j++) {
        addObjScenery(objURLs[i])
    }
}


//Add light
let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.position.x = -100;
directionalLight.position.z = 20;
directionalLight.position.y = 10;
directionalLight2.position.x = 100;
directionalLight2.position.z = 60;
directionalLight2.position.y = -10;
directionalLight.lookAt(0,0,0)
directionalLight2.lookAt(0,0,0)
scene.add(directionalLight)
scene.add(directionalLight2)

//Add Fog
// let fog = new THREE.FogExp2(0x000000, 0.02)
// scene.fog = fog;

if (level == 1) {
    const cubeLoader = new THREE.CubeTextureLoader();
    const texture = cubeLoader.load([
        'assets/images/skybox/space_ft.png',
        'assets/images/skybox/space_bk.png',
        'assets/images/skybox/space_up.png',
        'assets/images/skybox/space_dn.png',
        'assets/images/skybox/space_rt.png',
        'assets/images/skybox/space_lf.png',
    ], () => {
        scene.background = texture;
    }, () => {

    }, (e) => {
        console.log(e)
    });
} else {
    scene.background = new THREE.Color('red');
}

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 400)
const controls = new PointerLockControls(camera, document.body);
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0
scene.add(camera)

// Camera Custom Properties
camera.forward = new THREE.Vector3(0, 0, -1);
camera.left = new THREE.Vector3(1, 0, 0)
camera.up = new THREE.Vector3(0, 1, 0);
camera.heightOffset = 1;
camera.health = 100;
camera.canMove = false;
camera.currentChunk = 'Unknown'
camera.currentTile = 0
camera.currentGun = 0
camera.guns = [
    { name: 'pistol', damage: 5, roundsChambered: 6, roundsPerReload: 6, roundsTotal: 30, timeLastReloaded: 0, timeLastFired: 0, cooldown: 40 },
    { name: 'shotgun', damage: 10, roundsChambered: 2, roundsPerReload: 2, roundsTotal: 50, timeLastReloaded: 0, timeLastFired: 0, cooldown: 600 },
    { name: 'rocketLauncher', damage: 40, roundsChambered: 1, roundsPerReload: 1, roundsTotal: 4, timeLastReloaded: 0, timeLastFired: 0, cooldown: 600 },
]

camera.velocity = new THREE.Vector3(0, 0, 0);
camera.acceleration = 0.08;

// Enemy Tracking
camera.targettedEnemy = null

var targetMap = new THREE.TextureLoader().load(`assets/images/target.png`);
targetMap.magFilter = THREE.NearestFilter;
targetMap.minFilter = THREE.LinearMipMapLinearFilter;
var targetMat = new THREE.SpriteMaterial({ map: targetMap });
var target = new THREE.Sprite(targetMat)
target.visible = false;
target.scale.set(0.05, 0.05)
target.position.x = 0;
target.position.x = 0;
target.position.z = 1;
scene.add(target)

// Raycaster
const rayCaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();

// Collisioncasters
const fwdCaster = new THREE.Raycaster();
const bckCaster = new THREE.Raycaster();
const lftCaster = new THREE.Raycaster();
const rigCaster = new THREE.Raycaster();

fwdCaster.camera = camera;
fwdCaster.ray.origin = new Vector3(0, 1, 0)
fwdCaster.ray.direction = new Vector3(0, 1, -1)

bckCaster.camera = camera;
bckCaster.ray.origin = new Vector3(0, 1, 0)
bckCaster.ray.direction = new Vector3(0, 1, 1)

lftCaster.camera = camera;
lftCaster.ray.origin = new Vector3(0, 1, 0)
lftCaster.ray.direction = new Vector3(1, 1, 0)

rigCaster.camera = camera;
rigCaster.ray.origin = new Vector3(0, 1, 0)
rigCaster.ray.direction = new Vector3(-1, 1, 0)

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
    } else if (e.key == 'q') {
        if (camera.canMove && Date.now() > camera.guns[0].timeLastFired + camera.guns[0].cooldown) {
            rayCaster.setFromCamera(mousePosition, camera);
            const intersects = rayCaster.intersectObjects(scene.children);
            if (intersects[0] && intersects[0].object.type == "Mesh") {
                if (intersects[0].object == target) {
                    //console.log('marked the mark!')
                } else {
                    camera.targettedEnemy = intersects[0].object;
                }
            }
        } 
    } else if (e.key == '1') {
        camera.currentGun = 0
    } else if (e.key == '2') {
        //camera.currentGun = 1
    } else if (e.key == '3') {
        //camera.currentGun = 2
    } else if (e.key == 'p') {
        resetLevel()
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
            setTimeout(() => { gunhand.classList.remove('fire-animation') }, 250)
            var arrow = new THREE.ArrowHelper(camera.getWorldDirection(camera.forward), camera.getWorldPosition(camera.position), 1000, 0xff0000);
            arrow.cone.visible = false;
            arrow.line.scale.x = 5
            scene.add(arrow);
            rayCaster.far = 1000;
            rayCaster.setFromCamera(mousePosition, camera);
            const intersects = rayCaster.intersectObjects(scene.children);
            //console.log(intersects)
            if (intersects[0]) {
                if (intersects[0].object.type == "Sprite") {
                    //intersects[0].object.health -= camera.guns[camera.currentGun].damage;
                    //var blood = createEffectSprite('blood1', intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)
                    //sprites.push(blood)
                    //scene.add(blood);
                } else if (intersects[0].object.type == "Mesh") {
                    if (intersects[0].object.category = "monster") {
                        //console.log(intersects[0])
                        intersects[0].object.loseHealth(camera.guns[camera.currentGun].damage);
                    } else {
                        ricochet.play()
                    }
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
    paused = false;
});
controls.addEventListener('unlock', function () {
    pointerLock.style.display = 'block';
    camera.canMove = false;
    paused = true;
});

// This is a pseudo-Model class, in that it is called every frame.
var ALLOW_FWD = true;
var ALLOW_BACK = true;
var ALLOW_LEFT = true;
var ALLOW_RIGHT = true;
let BARRIER_DISTANCE = 4;
let SPEED_DOWN_SCALAR = .4
function acceptPlayerInputs() {

    if (camera.health <= 0) {
        camera.canMove = false;
        canvas.classList.add('dead')
        youDied.classList.add('died')
    }

    camera.getWorldDirection(camera.forward)
    camera.left = new Vector3(-1,0,0).applyQuaternion(camera.quaternion);
    
    ALLOW_FWD = true;
    ALLOW_BACK = true;
    ALLOW_LEFT = true;
    ALLOW_RIGHT = true;
    // //Determine forward collision objects
    fwdCaster.set(camera.position, camera.forward);
    var fwdIntersects = fwdCaster.intersectObjects(scene.children);
    if (fwdIntersects.length > 0) {
        if (fwdIntersects[0].distance < BARRIER_DISTANCE && fwdIntersects[0].object.type == 'Mesh') {
            fwdIntersects[0].object.velocity = camera.velocity
            ALLOW_FWD = false;
        }
    }
    // //Determine backward collision objects
    bckCaster.set(camera.position, new Vector3(-camera.forward.x, camera.forward.y, -camera.forward.z));
    var bckIntersects = bckCaster.intersectObjects(scene.children);
    if (bckIntersects.length > 0) {
        if (bckIntersects[0].distance < BARRIER_DISTANCE && bckIntersects[0].object.type == 'Mesh') {
            ALLOW_BACK = false;
        }
    }
    // //Determine backward collision objects
    lftCaster.set(camera.position, camera.left);
    var lftIntersects = lftCaster.intersectObjects(scene.children);
    if (lftIntersects.length > 0) {
        if (lftIntersects[0].distance < BARRIER_DISTANCE && lftIntersects[0].object.type == 'Mesh') {
            ALLOW_LEFT = false;
        }
    }
    // //Determine backward collision objects
    rigCaster.set(camera.position, new Vector3(-camera.left.x, camera.left.y, -camera.left.z));
    var rigIntersects = rigCaster.intersectObjects(scene.children);
    if (rigIntersects.length > 0) {
        if (rigIntersects[0].distance < BARRIER_DISTANCE && rigIntersects[0].object.type == 'Mesh') {
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
            camera.velocity = new Vector3(camera.velocity.x, camera.velocity.y, camera.velocity.z).lerp(new Vector3(-camera.left.x, -camera.left.y, -camera.left.z), camera.acceleration);
        }
        if (SPACE_PRESSED) {
            camera.velocity = new Vector3(camera.velocity.x, camera.velocity.y, camera.velocity.z).lerp(VECTOR_ZERO, camera.acceleration);
        }
        if (E_PRESSED) {
            console.log('interact')
        }
        if (R_PRESSED
            && camera.guns[camera.currentGun].roundsChambered == 0
            && camera.guns[camera.currentGun].roundsTotal > 0
            && Date.now() > camera.guns[camera.currentGun].timeLastReloaded + camera.guns[camera.currentGun].cooldown) {

            gunhand.classList.add('reload-animation');
            setTimeout(() => { gunhand.classList.remove('reload-animation') }, 1000)

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
class Monster {
    constructor(name, i) {
        this.mesh = {}
        objLoader.load(`assets/models/${name}.obj`, (obj) => {
            obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = objMaterials.get(name);
                    child.position.x = randBetween(-40, 40)
                    child.position.y = randBetween(-40, 40)
                    child.position.z = randBetween(-40, 40)
                    child.rotation.y = randBetween(-3, 3)
                    this.mesh = child;
                    this.mesh.velocity = new THREE.Vector3(0,0,0)
                    this.mesh.health = 20
                    this.mesh.category = 'monster'
                    this.mesh.name = getAbjadWord(4)
                    this.mesh.status = 'idle'
                    this.mesh.indexInMonsterArray = i
                    this.mesh.loseHealth = (loss) => {
                        this.mesh.health -= loss;
                        if (this.mesh.health <= 0) {
                            monsters.splice(i, 1);
                            scene.add(createEffectSprite('enemy1', this.mesh.position.x, this.mesh.position.y, this.mesh.position.z));
                            scene.remove(this.mesh);
                            console.log('killed ' + this.mesh.name)
                        }
                    }
                    monsters.push(this)
                    scene.add(child);
                }
            });
        });

    }
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
    //Player
    camera.position.x += camera.velocity.x;
    camera.position.y += camera.velocity.y;
    camera.position.z += camera.velocity.z;

    //Monsters
    for (let i = 0; i < monsters.length; i++) {
        monsters[i].mesh.lookAt(camera.position.x, camera.position.y, camera.position.z);
        monsters[i].mesh.velocity = new Vector3(0,0,1).applyQuaternion(monsters[i].mesh.quaternion).multiplyScalar(.08)
        monsters[i].mesh.position.x += monsters[i].mesh.velocity.x;
        monsters[i].mesh.position.y += monsters[i].mesh.velocity.y;
        monsters[i].mesh.position.z += monsters[i].mesh.velocity.z;
    }

    //Objects
    for (let i = 0; i < debris.length; i++) {
        debris[i].position.x += debris[i].velocity.x;
        debris[i].position.y += debris[i].velocity.y;
        debris[i].position.z += debris[i].velocity.z;
    }

    //EFFECTS Sprites
    for (let i = 0; i < sprites.length; i++) {
        sprites[i].timer++;
        if (sprites[i].timer == sprites[i].lifeSpan) {
            scene.remove(sprites[i])
            sprites.splice(i, 1);
        }
    }

    //TARGETER Sprites
    if (camera.targettedEnemy) {
        target.visible = true;
        var distanceVectorFromPlayer = new Vector3(camera.targettedEnemy.position.x - camera.position.x, 
            camera.targettedEnemy.position.y - camera.position.y,
            camera.targettedEnemy.position.z - camera.position.z).normalize()
        target.position.x = camera.position.x + distanceVectorFromPlayer.x
        target.position.y = camera.position.y + distanceVectorFromPlayer.y
        target.position.z = camera.position.z + distanceVectorFromPlayer.z
    }
}

for (let i = 0; i < 6; i++) {
    var monster = new Monster('ball', i)
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
//const bloompass =  new BloomPass(1, 1, 1, 1)
composer.addPass(renderPass)
//composer.addPass(bloompass)

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

function generateAdminText(elapsedTime) {
    // //STATS
    stats.innerText = "FPS: " + (1 / (elapsedTime - timeOfLastFrame)).toFixed(0) + "\n"
    stats.innerText = "Time: " + elapsedTime.toFixed(0) + "\n"
    stats.innerText += "Position: " + camera.position.x.toFixed(3) + " " + camera.position.y.toFixed(3) + " " + camera.position.z.toFixed(3) + "\n"
    stats.innerText += "Vector Fwd: " + camera.forward.x.toFixed(3) + ", " + camera.forward.y.toFixed(3) + ", " + camera.forward.z.toFixed(3) + "\n"
    stats.innerText += "Vector Left: " + camera.left.x.toFixed(3) + ", " + camera.left.y.toFixed(3) + ", " + camera.left.z.toFixed(3) + "\n"
    stats.innerText += "Velocity: " + camera.velocity.x.toFixed(3) + ", " + camera.velocity.y.toFixed(3) + ", " + camera.velocity.z.toFixed(3) + "\n"

    // //HEALTH AND AMMO
    healthAmmo.innerText = camera.health + " : " + camera.guns[camera.currentGun].roundsChambered + " / " + camera.guns[camera.currentGun].roundsTotal
}
function generateGunImage() {
    gunhand.src = gunSpriteURLS[camera.currentGun]
    gunhand.width = 400;
}
function generateCommsText(elapsedTime) {
    if (camera.canMove && elapsedTime > 2) {
        popup.className = 'popup'
        if (icon) {
            icon.src = './assets/images/npc1.png'
        }
        if (comms) {
            comms.innerText = story[0];
        }
    } else {
        popup.className = 'hidden'
    }
}
function generateRadarImage() {
    radar.innerText = "RADAR: \n \n"
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
    if (!paused) {
        worldMoves();
    }

    //VIEW
    composer.render(scene, camera)

    //Call tick again after this
    window.requestAnimationFrame(tick)

    // //Admin Overlay
    generateAdminText(elapsedTime);

    // //Generate Overlay
    generateRadarImage();
    generateGunImage();
    generateCommsText(elapsedTime);

    //This will be a number of milliseconds slower than elapsed time at the beginning of next frame.
    timeOfLastFrame = elapsedTime
}
tick()
//#endregion

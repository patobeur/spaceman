import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

// Camera
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bokehPass = new BokehPass(scene, camera, {
	focus: 1.0,
	aperture: 0.025,
	maxblur: 0.001,
	width: window.innerWidth,
	height: window.innerHeight,
});
composer.addPass(bokehPass);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 4;
dirLight.shadow.camera.bottom = -4;
dirLight.shadow.camera.left = -4;
dirLight.shadow.camera.right = 4;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

// Grid
const grid = new THREE.GridHelper(100, 100, 0xffffff, 0xffffff);
grid.material.opacity = 0.5;
grid.material.transparent = true;
scene.add(grid);

// Ground
const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100),
	new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Handle window resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
});

// Load 3D model
const loader = new GLTFLoader();
let model, animations, mixer;
let idleAction, walkAction, currentAction;

loader.load(
	"glb/RobotExpressive.glb",
	(gltf) => {
		model = gltf.scene;
		model.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		animations = gltf.animations;

		mixer = new THREE.AnimationMixer(model);

		if (animations && animations.length) {
			// Assuming 'idle' and 'walking' animations exist.
			// If only one animation, use it for both.
			const walkClip = THREE.AnimationClip.findByName(animations, "Walking");
			const idleClip = THREE.AnimationClip.findByName(animations, "Idle");

			if (walkClip && idleClip) {
				walkAction = mixer.clipAction(walkClip);
				idleAction = mixer.clipAction(idleClip);
				currentAction = idleAction;
				idleAction.play();
			} else if (animations.length > 0) {
				// Play the first animation if idle/walking aren't found
				mixer.clipAction(animations[0]).play();
			}
		}

		scene.add(model);
	},
	undefined,
	(error) => {
		console.error(error);
	}
);

// Keyboard input
const keys = {
	w: false,
	a: false,
	s: false,
	d: false,
	arrowUp: false,
	arrowLeft: false,
	arrowDown: false,
	arrowRight: false,
};

document.addEventListener("keydown", (event) => {
	switch (event.code) {
		case "KeyZ":
		case "KeyW":
			keys.w = true;
			break;
		case "KeyQ":
		case "KeyA":
			keys.a = true;
			break;
		case "KeyS":
			keys.s = true;
			break;
		case "KeyD":
			keys.d = true;
			break;
		case "ArrowUp":
			keys.arrowUp = true;
			break;
		case "ArrowLeft":
			keys.arrowLeft = true;
			break;
		case "ArrowDown":
			keys.arrowDown = true;
			break;
		case "ArrowRight":
			keys.arrowRight = true;
			break;
	}
});

document.addEventListener("keyup", (event) => {
	switch (event.code) {
		case "KeyZ":
		case "KeyW":
			keys.w = false;
			break;
		case "KeyQ":
		case "KeyA":
			keys.a = false;
			break;
		case "KeyS":
			keys.s = false;
			break;
		case "KeyD":
			keys.d = false;
			break;
		case "ArrowUp":
			keys.arrowUp = false;
			break;
		case "ArrowLeft":
			keys.arrowLeft = false;
			break;
		case "ArrowDown":
			keys.arrowDown = false;
			break;
		case "ArrowRight":
			keys.arrowRight = false;
			break;
	}
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
	const delta = clock.getDelta();

	if (mixer) {
		mixer.update(delta);
	}

	if (model) {
		const moveSpeed = 5 * delta;
		const rotateSpeed = 3 * delta;

		const isMoving = keys.w || keys.arrowUp || keys.s || keys.arrowDown;
		const isRotating = keys.a || keys.arrowLeft || keys.d || keys.arrowRight;
		const isMovingOrRotating = isMoving || isRotating;

		if (walkAction && idleAction) {
			if (isMovingOrRotating && currentAction !== walkAction) {
				console.log("Switching to walking animation");
				currentAction = walkAction;
				idleAction.fadeOut(0.2);
				walkAction.reset().fadeIn(0.2).play();
			} else if (!isMovingOrRotating && currentAction !== idleAction) {
				console.log("Switching to idle animation");
				currentAction = idleAction;
				walkAction.fadeOut(0.2);
				idleAction.reset().fadeIn(0.2).play();
			}
		}

		if (keys.w || keys.arrowUp) {
			model.translateZ(moveSpeed);
		}
		if (keys.s || keys.arrowDown) {
			model.translateZ(-moveSpeed);
		}
		if (keys.a || keys.arrowLeft) {
			model.rotateY(rotateSpeed);
		}
		if (keys.d || keys.arrowRight) {
			model.rotateY(-rotateSpeed);
		}

		// Third-person camera
		const targetPosition = new THREE.Vector3();
		model.getWorldPosition(targetPosition);

		const cameraOffset = new THREE.Vector3(0, 4, -8); // x, y, z offset
		const cameraPosition = cameraOffset
			.clone()
			.applyQuaternion(model.quaternion);
		cameraPosition.add(targetPosition);

		camera.position.lerp(cameraPosition, 0.1);

		const lookAtPosition = new THREE.Vector3().copy(targetPosition);
		lookAtPosition.y += 1.5; // Look at the torso
		camera.lookAt(lookAtPosition);
	}

	requestAnimationFrame(animate);
	composer.render();
}

animate();

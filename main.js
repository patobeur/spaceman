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
const lightDistance = 40;
const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = lightDistance;
dirLight.shadow.camera.bottom = -lightDistance;
dirLight.shadow.camera.left = -lightDistance;
dirLight.shadow.camera.right = lightDistance;
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

// Mouse input
let isMouseDown = false;
let invertY = false;

const invertYCheckbox = document.getElementById('invert-y-axis');
invertYCheckbox.addEventListener('change', () => {
    invertY = invertYCheckbox.checked;
});

document.addEventListener("mousedown", (event) => {
	if (event.button === 0) { // Left mouse button
		isMouseDown = true;
	}
});

document.addEventListener("mouseup", (event) => {
	if (event.button === 0) { // Left mouse button
		isMouseDown = false;
	}
});

let cameraOffset = new THREE.Vector3(0, 4, -8); // Initial camera offset

document.addEventListener("mousemove", (event) => {
	if (isMouseDown && model) {
		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		if (invertY) {
			movementY *= -1;
		}

		// Create a quaternion for the horizontal rotation
		const quaternionX = new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 1, 0),
			-movementX * 0.01
		);

		// Apply the horizontal rotation to the camera offset
		cameraOffset.applyQuaternion(quaternionX);

		// Vertical rotation with clamping
		const verticalAngle = Math.asin(cameraOffset.y / cameraOffset.length());
		const maxVerticalAngle = Math.PI / 2 - 0.1; // Clamp near the poles
		const newVerticalAngle = verticalAngle - movementY * 0.01;

		if (Math.abs(newVerticalAngle) < maxVerticalAngle) {
			const rotationAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(
				new THREE.Quaternion().setFromUnitVectors(
					new THREE.Vector3(0, 0, -1),
					new THREE.Vector3(cameraOffset.x, 0, cameraOffset.z).normalize()
				)
			);
			const quaternionY = new THREE.Quaternion().setFromAxisAngle(
				rotationAxis,
				-movementY * 0.01
			);
			cameraOffset.applyQuaternion(quaternionY);
		}
	}
});

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
		const right = new THREE.Vector3().crossVectors(
			camera.up,
			new THREE.Vector3().subVectors(model.position, camera.position)
		).normalize();

		if (keys.a || keys.arrowLeft) {
			model.position.addScaledVector(right, -moveSpeed);
		}
		if (keys.d || keys.arrowRight) {
			model.position.addScaledVector(right, moveSpeed);
		}

		// Third-person camera
		const targetPosition = new THREE.Vector3();
		model.getWorldPosition(targetPosition);

		const cameraPosition = targetPosition.clone().add(cameraOffset);

		camera.position.lerp(cameraPosition, 0.1);
		camera.lookAt(targetPosition.clone().set(targetPosition.x, targetPosition.y + 1.5, targetPosition.z));

		// Character orientation
		const lookDirection = new THREE.Vector3()
			.subVectors(camera.position, targetPosition);
		lookDirection.y = 0;
		lookDirection.normalize();

		const angle = Math.atan2(lookDirection.x, lookDirection.z);

		const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 1, 0),
			angle + Math.PI
		);
		model.quaternion.slerp(targetQuaternion, 0.1);
	}

	requestAnimationFrame(animate);
	composer.render();
}

animate();

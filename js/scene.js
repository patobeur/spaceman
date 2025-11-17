// js/scene.js
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export function setupScene() {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	scene.fog = new THREE.Fog(0x000000, 20, 50);

	const camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.set(0, 2, 5);

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	document.getElementById("game-container").appendChild(renderer.domElement);

	const composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		0.6, // strength
		0.1, // radius
		0.85 // threshold
	);
	composer.addPass(bloomPass);

	// Ambiance lumineuse et lumières directionnelles style TRON
	const hemiLight = new THREE.HemisphereLight(0x000000, 0xffffff);
	hemiLight.position.set(0, 20, 0);
	scene.add(hemiLight);

	const dirLight1 = new THREE.DirectionalLight(0x00ffff, 3); // Cyan
	dirLight1.position.set(15, 20, 10);
	dirLight1.castShadow = true;
	scene.add(dirLight1);

	const dirLight2 = new THREE.DirectionalLight(0xff00ff, 3); // Magenta
	dirLight2.position.set(-15, 20, -10);
	dirLight2.castShadow = true;
	scene.add(dirLight2);

	const grid = new THREE.GridHelper(100, 100, 0x00ffff, 0x00ffff);
	grid.material.opacity = 0.5;
	grid.material.transparent = true;
	scene.add(grid);

	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({ color: 0x000000, depthWrite: false })
	);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);

	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		composer.setSize(window.innerWidth, window.innerHeight);
	});

	return { scene, camera, renderer, composer };
}

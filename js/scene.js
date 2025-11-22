// js/scene.js
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { Lights } from "./lights/Lights.js";
import { loadRocks } from "./loader.js";

export const rocks = [];

export function setupScene() {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xa0a0bb);
	scene.fog = new THREE.Fog(0xa0a0bb, 20, 50);

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

	const bokehPass = new BokehPass(scene, camera, {
		focus: 1.0,
		aperture: 0.025,
		maxblur: 0.0015,
		width: window.innerWidth,
		height: window.innerHeight,
	});
	composer.addPass(bokehPass);

	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		0.6, // strength
		0.1, // radius
		0.85 // threshold
	);
	composer.addPass(bloomPass);
	// Ambiance lumineuse et lumières directionnelles style TRON
	const hemiLight = new THREE.HemisphereLight(0x000000, 0xffffff);
	// const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666699);
	hemiLight.position.set(0, 20, 0);
	scene.add(hemiLight);

	const AllLights = new Lights(scene);

	const grid = new THREE.GridHelper(100, 100, 0xffffff, 0xffffff);
	grid.material.opacity = 0.5;
	grid.material.transparent = true;
	scene.add(grid);

	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({ color: 0x9999bb, depthWrite: false })
	);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);

	loadRocks(scene, (rockModel) => {
		const rock1 = rockModel.clone();
		rock1.position.set(5, 0, 5);
		rock1.userData = { ore: 10 };
		scene.add(rock1);
		rocks.push(rock1);

		const rock2 = rockModel.clone();
		rock2.position.set(-5, 0, -5);
		rock2.userData = { ore: 10 };
		scene.add(rock2);
		rocks.push(rock2);

		const rock3 = rockModel.clone();
		rock3.position.set(5, 0, -5);
		rock3.userData = { ore: 10 };
		scene.add(rock3);
		rocks.push(rock3);
	});

	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		composer.setSize(window.innerWidth, window.innerHeight);
	});

	return { scene, camera, renderer, composer };
}

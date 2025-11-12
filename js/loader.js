// js/loader.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function loadModel(scene, callback) {
	const loader = new GLTFLoader();
	loader.load(
		"glb/RobotExpressive.glb",
		(gltf) => {
			const model = gltf.scene;
			model.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});

			const animations = gltf.animations;
			const mixer = new THREE.AnimationMixer(model);
			let walkAction, idleAction, currentAction;

			if (animations && animations.length) {
				const walkClip = THREE.AnimationClip.findByName(animations, "Walking");
				const idleClip = THREE.AnimationClip.findByName(animations, "Idle");

				if (walkClip && idleClip) {
					walkAction = mixer.clipAction(walkClip);
					idleAction = mixer.clipAction(idleClip);
					currentAction = idleAction;
					idleAction.play();
				} else if (animations.length > 0) {
					mixer.clipAction(animations[0]).play();
				}
			}

			scene.add(model);
			callback(model, mixer, walkAction, idleAction, currentAction);
		},
		undefined,
		(error) => {
			console.error(error);
		}
	);
}

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
			let walkAction, idleAction, standingAction, thumbsUpAction, currentAction;

			if (animations && animations.length) {
				const walkClip = THREE.AnimationClip.findByName(animations, "Walking");
				const idleClip = THREE.AnimationClip.findByName(animations, "Idle");
				const standingClip = THREE.AnimationClip.findByName(animations, "Standing");
				const thumbsUpClip = THREE.AnimationClip.findByName(animations, "ThumbsUp");

				if (walkClip && idleClip && standingClip && thumbsUpClip) {
					walkAction = mixer.clipAction(walkClip);
					idleAction = mixer.clipAction(idleClip);
					standingAction = mixer.clipAction(standingClip);
					thumbsUpAction = mixer.clipAction(thumbsUpClip);
					currentAction = idleAction;
					idleAction.play();
				} else if (animations.length > 0) {
					mixer.clipAction(animations[0]).play();
				}
			}

			scene.add(model);
			callback(model, mixer, walkAction, idleAction, standingAction, thumbsUpAction, currentAction);
		},
		undefined,
		(error) => {
			console.error(error);
		}
	);
}

export function loadRocks(scene, callback) {
	const loader = new GLTFLoader();
	loader.load(
		"glb/Rock.glb",
		(gltf) => {
			const rockModel = gltf.scene;
			rockModel.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
			callback(rockModel);
		},
		undefined,
		(error) => {
			console.error(error);
		}
	);
}

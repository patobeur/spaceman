// main.js
import * as THREE from "three";
import { setupScene, rocks } from "./js/scene.js";
import { loadModel } from "./js/loader.js";
import { setupControls } from "./js/controls.js";
import { updateUI } from "./js/ui.js";

const { scene, camera, renderer, composer } = setupScene();
let model, mixer, walkAction, idleAction, standingAction, thumbsUpAction, currentAction;
let controls;
let isMining = false;

loadModel(scene, (loadedModel, loadedMixer, loadedWalkAction, loadedIdleAction, loadedStandingAction, loadedThumbsUpAction, loadedCurrentAction) => {
	model = loadedModel;
	mixer = loadedMixer;
	walkAction = loadedWalkAction;
	idleAction = loadedIdleAction;
	standingAction = loadedStandingAction;
	thumbsUpAction = loadedThumbsUpAction;
	currentAction = loadedCurrentAction;
	controls = setupControls(camera, model, document);
});

const clock = new THREE.Clock();

function animate() {
	const delta = clock.getDelta();

	if (mixer) {
		mixer.update(delta);
	}

	if (model && controls && !isMining) {
		const { keys, cameraOffset } = controls;
		const moveSpeed = 5 * delta;

		const isMoving = keys.w || keys.arrowUp || keys.s || keys.arrowDown;
		const isRotating = keys.a || keys.arrowLeft || keys.d || keys.arrowRight;
		const isMovingOrRotating = isMoving || isRotating;

		if (keys.f) {
			rocks.forEach(rock => {
				if (model.position.distanceTo(rock.position) < 2 && rock.userData.ore > 0) {
					isMining = true;
					currentAction.fadeOut(0.2);
					standingAction.reset().fadeIn(0.2).play();
					currentAction = standingAction;

					setTimeout(() => {
						rock.userData.ore--;
						if (rock.userData.ore === 0) {
							currentAction.fadeOut(0.2);
							thumbsUpAction.reset().fadeIn(0.2).play();
							currentAction = thumbsUpAction;
							setTimeout(() => {
								isMining = false;
								currentAction.fadeOut(0.2);
								idleAction.reset().fadeIn(0.2).play();
								currentAction = idleAction;
							}, 2000);
						} else {
							isMining = false;
							currentAction.fadeOut(0.2);
							idleAction.reset().fadeIn(0.2).play();
							currentAction = idleAction;
						}
					}, 2000);
				}
			});
		}

		if (walkAction && idleAction) {
			if (isMovingOrRotating && currentAction !== walkAction) {
				currentAction = walkAction;
				idleAction.fadeOut(0.2);
				walkAction.reset().fadeIn(0.2).play();
			} else if (!isMovingOrRotating && currentAction !== idleAction) {
				currentAction = idleAction;
				walkAction.fadeOut(0.2);
				idleAction.reset().fadeIn(0.2).play();
			}
		}

		if (keys.w || keys.arrowUp) model.translateZ(moveSpeed);
		if (keys.s || keys.arrowDown) model.translateZ(-moveSpeed);

		const right = new THREE.Vector3().crossVectors(camera.up, new THREE.Vector3().subVectors(model.position, camera.position)).normalize();
		if (keys.a || keys.arrowLeft) model.position.addScaledVector(right, moveSpeed);
		if (keys.d || keys.arrowRight) model.position.addScaledVector(right, -moveSpeed);

		const targetPosition = new THREE.Vector3();
		model.getWorldPosition(targetPosition);
		const cameraPosition = targetPosition.clone().add(cameraOffset);
		camera.position.lerp(cameraPosition, 0.1);
		camera.lookAt(targetPosition.clone().set(targetPosition.x, targetPosition.y + 1.5, targetPosition.z));

		const lookDirection = new THREE.Vector3().subVectors(camera.position, targetPosition);
		lookDirection.y = 0;
		lookDirection.normalize();
		const angle = Math.atan2(lookDirection.x, lookDirection.z);
		const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle + Math.PI);
		model.quaternion.slerp(targetQuaternion, 0.1);

		updateUI(model);
	}

	requestAnimationFrame(animate);
	composer.render();
}

animate();

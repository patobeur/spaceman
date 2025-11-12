// js/controls.js
import * as THREE from "three";

export function setupControls(camera, model, document) {
	let isMouseDown = false;
	let invertY = false;
	let cameraOffset = new THREE.Vector3(0, 16, -8);

	const invertYCheckbox = document.getElementById("invert-y-axis");
	invertYCheckbox.addEventListener("change", () => {
		invertY = invertYCheckbox.checked;
	});

	document.addEventListener("mousedown", (event) => {
		if (event.button === 0) {
			isMouseDown = true;
		}
	});

	document.addEventListener("mouseup", (event) => {
		if (event.button === 0) {
			isMouseDown = false;
		}
	});

	document.addEventListener("mousemove", (event) => {
		if (isMouseDown && model) {
			const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			if (invertY) {
				movementY *= -1;
			}

			const quaternionX = new THREE.Quaternion().setFromAxisAngle(
				new THREE.Vector3(0, 1, 0),
				-movementX * 0.01
			);
			cameraOffset.applyQuaternion(quaternionX);

			const verticalAngle = Math.asin(cameraOffset.y / cameraOffset.length());
			const maxVerticalAngle = Math.PI / 2 - 0.1;
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

	const keys = {
		w: false, a: false, s: false, d: false,
		arrowUp: false, arrowLeft: false, arrowDown: false, arrowRight: false,
		e: false,
	};

	document.addEventListener("keydown", (event) => {
		switch (event.code) {
			case "KeyE": keys.e = true; break;
			case "KeyZ": case "KeyW": keys.w = true; break;
			case "KeyQ": case "KeyA": keys.a = true; break;
			case "KeyS": keys.s = true; break;
			case "KeyD": keys.d = true; break;
			case "ArrowUp": keys.arrowUp = true; break;
			case "ArrowLeft": keys.arrowLeft = true; break;
			case "ArrowDown": keys.arrowDown = true; break;
			case "ArrowRight": keys.arrowRight = true; break;
		}
	});

	document.addEventListener("keyup", (event) => {
		switch (event.code) {
			case "KeyE": keys.e = false; break;
			case "KeyZ": case "KeyW": keys.w = false; break;
			case "KeyQ": case "KeyA": keys.a = false; break;
			case "KeyS": keys.s = false; break;
			case "KeyD": keys.d = false; break;
			case "ArrowUp": keys.arrowUp = false; break;
			case "ArrowLeft": keys.arrowLeft = false; break;
			case "ArrowDown": keys.arrowDown = false; break;
			case "ArrowRight": keys.arrowRight = false; break;
		}
	});

	return { keys, cameraOffset };
}

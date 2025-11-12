// js/ui.js
import * as THREE from "three";

export function updateUI(model) {
	const coordinatesDiv = document.getElementById("coordinates");
	const rotationDiv = document.getElementById("rotation");

	if (model) {
		const position = model.position;
		coordinatesDiv.textContent =
			`x: ${position.x.toFixed(2)},` +
			` y: ${position.y.toFixed(2)},` +
			` z: ${position.z.toFixed(2)}`;

		const rotation = new THREE.Euler().setFromQuaternion(model.quaternion);
		rotationDiv.textContent =
			`x: ${(rotation.x * (180 / Math.PI)).toFixed(2)}°, ` +
			`y: ${(rotation.y * (180 / Math.PI)).toFixed(2)}°, ` +
			`z: ${(rotation.z * (180 / Math.PI)).toFixed(2)}°, `;
	}
}

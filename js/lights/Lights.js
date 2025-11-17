import * as THREE from "three";
export class Lights {
	constructor(scene) {
		this.scene = scene;
		this.lights = [];
		this.lightsConfig = [
			{
				active: false,
				name: "dirLight",
				type: "DirectionalLight",
				pos: [15, 20, 10],
				color: 0x00ff00,
				intensity: 1,
				castShadow: true,
				cameraNear: 0.1,
				cameraFar: 4000,
				lightDistance: 40,
			},
			{
				active: false,
				name: "dirLight1",
				type: "DirectionalLight",
				pos: [-15, 20, -10],
				color: 0x0000ff,
				intensity: 1,
				castShadow: true,
				cameraNear: 0.1,
				cameraFar: 4000,
				lightDistance: 40,
			},
			{
				active: false,
				name: "dirLight2",
				type: "DirectionalLight",
				pos: [-15, 20, 10],
				color: 0xff0000,
				intensity: 1,
				castShadow: true,
				cameraNear: 0.1,
				cameraFar: 4000,
				lightDistance: 40,
			},
			{
				active: true,
				name: "dirLight3",
				type: "DirectionalLight",
				pos: [3, 40, 10],
				color: 0xffffff,
				intensity: 1,
				castShadow: true,
				cameraNear: 0.1,
				cameraFar: 4000,
				lightDistance: 40,
			},
		];
		this.set_lights();
	}
	set_lights() {
		this.lightsConfig.forEach((config) => {
			if (config.active) {
				const light = new THREE.DirectionalLight(
					config.color,
					config.intensity
				);
				light.name = config.name;
				light.position.set(config.pos[0], config.pos[1], config.pos[2]);
				light.castShadow = config.castShadow;
				light.shadow.camera.top = config.lightDistance;
				light.shadow.camera.bottom = -config.lightDistance;
				light.shadow.camera.left = -config.lightDistance;
				light.shadow.camera.right = config.lightDistance;
				light.shadow.camera.near = config.cameraNear;
				light.shadow.camera.far = config.cameraFar;
				console.log(light);
				this.lights.push(light);
				this.scene.add(light);
			}
		});
	}
}

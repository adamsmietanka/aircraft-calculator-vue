import Plotly from "plotly.js-gl3d-dist-min";
import { bezier, bezierOvershoot } from "./interp";

export class Camera {
  FRAME_NUMBER = 50;

  constructor(id, layout) {
    this.id = id;
    this.layout = layout;
  }

  isFacingDown({ x, y, z }) {
    return x * y * z === 0;
  }

  async animate(target) {
    let { eye: startCam } = this.layout.scene.camera;
    for (let i = 0; i <= this.FRAME_NUMBER; i++) {
      let mu = i / this.FRAME_NUMBER;
      this.layout.scene.camera.eye =
        this.isFacingDown(startCam) || this.isFacingDown(target)
          ? this.cameraOrbital(startCam, target, mu)
          : this.cameraLinear(startCam, target, mu);
      await new Promise((r) => setTimeout(r, 1000 / this.FRAME_NUMBER));
      Plotly.relayout(this.id, this.layout);
    }
  }

  cameraLinear(startPos, targetPos, mu) {
    return {
      x: bezierOvershoot(startPos.x, targetPos.x, mu),
      y: bezierOvershoot(startPos.y, targetPos.y, mu),
      z: bezierOvershoot(startPos.z, targetPos.z, mu),
    };
  }

  cameraOrbital(startPos, targetPos, mu) {
    let { x, y, z } = startPos;
    let firstHalf = Math.min(2 * mu, 1);
    let secondHalf = Math.min(2 * mu - 1, 1);

    if (this.isFacingDown(startPos)) {
      x = bezier(startPos.x, targetPos.x, firstHalf);
      z = bezier(startPos.z, targetPos.z, firstHalf);
      if (0.5 < mu) {
        y = bezierOvershoot(startPos.y, targetPos.y, secondHalf);
      }
    } else {
      y = bezier(startPos.y, targetPos.y, firstHalf);
      if (0.5 < mu) {
        x = bezier(startPos.x, targetPos.x, secondHalf);
        z = bezier(startPos.z, targetPos.z, secondHalf);
      }
    }
    return { x, y, z };
  }
}

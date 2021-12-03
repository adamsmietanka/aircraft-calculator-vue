import Plotly from "plotly.js-gl3d-dist-min";

export class Camera {
  FRAME_NUMBER = 50;

  constructor(id, layout) {
    this.id = id;
    this.layout = layout;
  }

  cubicBezier(p1, p2, p3, p4, x) {
    return (
      p1 * (1 - x) * (1 - x) * (1 - x) +
      p2 * x * (1 - x) * (1 - x) * 3 +
      p3 * x * x * (1 - x) * 3 +
      p4 * x * x * x
    );
  }

  linearInterp(y1, y2, mu) {
    return y1 * (1 - mu) + y2 * mu;
  }

  bezierOvershoot(y1, y2, mu) {
    let delta = (y2 - y1) * -0.3;
    return this.cubicBezier(y1, y1 - delta, y2 - delta, y2, mu);
  }

  bezier(y1, y2, mu) {
    let delta = (y2 - y1) * 0.4;
    return this.cubicBezier(y1, y1 + delta, y2 - delta, y2, mu);
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
      x: this.bezierOvershoot(startPos.x, targetPos.x, mu),
      y: this.bezierOvershoot(startPos.y, targetPos.y, mu),
      z: this.bezierOvershoot(startPos.z, targetPos.z, mu),
    };
  }

  cameraOrbital(startPos, targetPos, mu) {
    let { x, y, z } = startPos;
    let firstHalf = Math.min(2 * mu, 1);
    let secondHalf = Math.min(2 * mu - 1, 1);

    if (this.isFacingDown(startPos)) {
      x = this.bezier(startPos.x, targetPos.x, firstHalf);
      z = this.bezier(startPos.z, targetPos.z, firstHalf);
      if (0.5 < mu) {
        y = this.bezierOvershoot(startPos.y, targetPos.y, secondHalf);
      }
    } else {
      y = this.bezier(startPos.y, targetPos.y, firstHalf);
      if (0.5 < mu) {
        x = this.bezier(startPos.x, targetPos.x, secondHalf);
        z = this.bezier(startPos.z, targetPos.z, secondHalf);
      }
    }
    return { x, y, z };
  }
}

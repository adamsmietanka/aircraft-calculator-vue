const cubicBezier = (p1, p2, p3, p4, x) =>
  p1 * (1 - x) * (1 - x) * (1 - x) +
  p2 * x * (1 - x) * (1 - x) * 3 +
  p3 * x * x * (1 - x) * 3 +
  p4 * x * x * x;

export const linearInterp = (y1, y2, mu) => y1 * (1 - mu) + y2 * mu;

export const bezierOvershoot = (y1, y2, mu) => {
  let delta = (y2 - y1) * -0.3;
  return cubicBezier(y1, y1 - delta, y2 - delta, y2, mu);
};

export const bezier = (y1, y2, mu) => {
  let delta = (y2 - y1) * 0.4;
  return cubicBezier(y1, y1 + delta, y2 - delta, y2, mu);
};

export const bezierEasier = (y1, y2, mu) => {
  let delta = (y2 - y1) * 0.01;
  return cubicBezier(y1, y1 + delta, y2 - delta, y2, mu);
};

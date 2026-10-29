(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FallingRotation = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  return {
    nextOrientation: (angle) => (angle + 1) % 4,
    nextStartingAngle: (angle) => (angle >= 3 ? 1 : angle + 1),
    isUpright: (angle) => angle === 0,
  };
});

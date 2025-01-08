// Use the canvas2D API to perform hit-testing against each
// hex in the hexgrid layout.
export function hitTest(hitX, hitY) {
  var ctx = this.renderingContext;

  // Reset the canvas transform
  ctx.resetTransform();
  ctx.scale(this.pixelRatio, this.pixelRatio);

  // Scale hitX,Y by pixelRatio as well as the geometry,
  // so they're in a consistent coordinate space.
  hitX *= this.pixelRatio;
  hitY *= this.pixelRatio;

  // Apply pan and zoom (scaled by pixelRatio)
  ctx.translate(this.panX, this.panY);
  ctx.scale(this.zoom, this.zoom);

  var prevX = 0, prevY = 0, hover = null;
  for (var hex of this.hex.grid.layout) {
    // Translate to new hex position without resetting the transform.
    ctx.translate(hex.x - prevX, hex.y - prevY);
    prevX = hex.x; prevY = hex.y;

    // Hit-test the hexedge path transformed by the current canvas transform.
    if (ctx.isPointInPath(this.hexedge, hitX, hitY)) {
      hover = hex;
    }
  }

  return hover;
}

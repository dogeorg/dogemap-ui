export function draw() {
  const ctx = this.renderingContext

  // Clear the entire canvas area 
  // before applying new transformations and redrawing the content
  ctx.clearRect(0, 0, this.width, this.height);

  // Save the starting canvas state
  ctx.save();

  // Apply pan and zoom
  ctx.translate(this.panX, this.panY);
  ctx.scale(this.zoom, this.zoom);

  var prevX = 0, prevY = 0;
  for (var hex of this.hex.grid.layout) {
    ctx.translate(hex.x - prevX, hex.y - prevY);
    prevX = hex.x; prevY = hex.y;

    // Border
    ctx.fillStyle = "#75FBF922";
    ctx.fill(this.hexedge);

    // Fill
    ctx.fillStyle = this.color(hex);
    ctx.fill(this.hexagon);
  }

  // Restore the original canvas state
  ctx.restore();
}

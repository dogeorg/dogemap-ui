export function draw() {
  var ctx = this.renderingContext;

  // Reset the canvas transform
  ctx.resetTransform();
  ctx.scale(this.pixelRatio, this.pixelRatio);

  // Clear the entire canvas area 
  // before applying new transformations and redrawing the content
  ctx.clearRect(0, 0, this.width, this.height);

  // Apply pan and zoom (scaled by pixelRatio)
  ctx.translate(this.panX, this.panY);
  ctx.scale(this.zoom, this.zoom);

  var prevX = 0, prevY = 0;
  for (var hex of this.hex.grid.layout) {
    // Translate to new hex position without resetting the transform.
    ctx.translate(hex.x - prevX, hex.y - prevY);
    prevX = hex.x; prevY = hex.y;
  
    // Border
    ctx.fillStyle = "#75FBF922";
    ctx.fill(this.hexedge);

    // Fill
    ctx.fillStyle = this.color(hex);
    ctx.fill(this.hexagon);
  }

  // Render the hovered hex cell
  const found = this.hover;
  if (found !== null) {
    ctx.translate(found.x - prevX, found.y - prevY);
    prevX = found.x; prevY = found.y;
    ctx.fillStyle = "#75FBF9FF";
    ctx.fill(this.hexedge);
    ctx.fillStyle = this.color(found);
    ctx.fill(this.hexagon);
  }

  // Render the selected hex cell
  const selected = this.selected;
  if (selected !== null) {
    ctx.translate(selected.x - prevX, selected.y - prevY);
    ctx.fillStyle = "#FB7575FF";
    ctx.fill(this.hexedge);
    ctx.fillStyle = this.color(selected);
    ctx.fill(this.hexagon);
  }
}

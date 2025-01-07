export function draw() {
  var ctx = this.renderingContext;
  var hitX = this.hoverX, hitY = this.hoverY;
  var prevX = 0, prevY = 0;

  // Clear the entire canvas area 
  // before applying new transformations and redrawing the content
  ctx.clearRect(0, 0, this.width, this.height);

  // Save the starting canvas state
  ctx.save();

  // Apply pan and zoom (on top of scale by pixelRatio)
  ctx.translate(this.panX, this.panY);
  ctx.scale(this.zoom, this.zoom);

  // Clear hovered cell.
  this.hover = null;

  for (var hex of this.hex.grid.layout) {
    ctx.translate(hex.x - prevX, hex.y - prevY);
    prevX = hex.x; prevY = hex.y;

    // Hit-test the hexedge path transformed by the current canvas transform
    // (hex translation, zoom, pan, pixelRatio)
    if (ctx.isPointInPath(this.hexedge, hitX, hitY)) {
      this.hover = hex;
    }
  
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

  // Restore the transformed canvas state
  ctx.restore();
}

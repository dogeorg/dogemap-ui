export function handleZoom(event) {
  const ctx = this.renderingContext
  const { transform } = event;

  // Note: d3.zoom operates internally in CSS coordinates, not high-DPI
  // coordinates. Therefore we keep panX,Y in CSS coordinates as well
  // and scale up by pixelRatio in draw() and hitTest()

  // Adjust mouseover position when panning, but not when zooming
  // (when zooming we don't want to change the mouse position)
  if (transform.k === this.zoom) {
    this.hoverX += (transform.x - this.panX);
    this.hoverY += (transform.y - this.panY);
  }

  // update HexMap state.
  this.panX = transform.x;
  this.panY = transform.y;
  this.zoom = transform.k;

  requestAnimationFrame(()=>{
    this.draw();
  });
}

export function handleZoom(event) {
  const ctx = this.renderingContext
  const { transform } = event;

  // adjust mouseover position, but not when zooming
  // (we don't need the translate delta caused by zooming)
  if (transform.k === this.zoom) {
    this.hoverX += (transform.x - this.panX) * this.pixelRatio;
    this.hoverY += (transform.y - this.panY) * this.pixelRatio;
  }

  // update HexMap state.
  this.panX = transform.x;
  this.panY = transform.y;
  this.zoom = transform.k;

  requestAnimationFrame(()=>{
    this.draw();
  });
}

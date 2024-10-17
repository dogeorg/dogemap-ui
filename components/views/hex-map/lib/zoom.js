export function handleZoom(event) {
  const ctx = this.renderingContext
  const { transform } = event;

  // update HexMap state.
  this.panX = transform.x;
  this.panY = transform.y;
  this.zoom = transform.k;

  requestAnimationFrame(()=>{
    this.draw();
  });
}

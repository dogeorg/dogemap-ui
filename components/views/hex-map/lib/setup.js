// World size: this is the size of the 'document' we can zoom/pan around.
const docWidth = 2000, docHeight = 1000;

export function setup () {
  console.group('+++ HexMap loading..');

  // Set the height and width to whatever the the dimensions of the host element are.
  const { width, height } = this.getBoundingClientRect();
  if (width <= 0 || height <= 0) return; // BUG: sometimes (0,0) which crashes.

  this.width = width;
  this.height = height;
  this.pixelRatio = window.devicePixelRatio || 1;

  // Establish canvas.
  this.canvas = d3
    .select(this.shadowRoot.querySelector("canvas#Hexmap"))
    .attr("width", this.width * this.pixelRatio)
    .attr("height", this.height * this.pixelRatio)
    .style("width", this.width + 'px')
    .style("height", this.height + 'px');

  // Test canvas
  const canvasReady =
    this.canvas &&
    this.canvas._groups &&
    this.canvas._groups.length === 1 &&
    this.canvas._groups[0][0].id === "Hexmap"

  if (!canvasReady) {
    console.warn('Hexmap failed canvas ready checks', this.canvas);
  }

  if (canvasReady) {
    console.log('Complete.');
  }

  console.groupEnd();

  console.group('Configuring canvas..')
  // Retreive the 2d rendering context of our canvas
  this.renderingContext = this.canvas.node().getContext("2d");

  // Set the rendering context scale to match the pixel density 
  // of the user's device to ensure a clear image.
  console.log('..setting scale');
  this.renderingContext.scale(this.pixelRatio, this.pixelRatio);

  // Projection (a function that converts geographical coordinates 
  // (eg latitude and longitude) from a spherical surface (like the Earth)
  // to a point on a flat surface).

  // We are using the Robinson projection, which is a commonly used for 
  // displaying the entire world in a more visually pleasing way.
  console.log('..setting projection');
  this.projection = d3.geoRobinson().fitSize([docWidth, docHeight], this.world);

  // We initialize a geoPath generator, which is used to convert GeoJSON data 
  // into SVG path data or Canvas drawing paths, depending on the rendering context provided.
  // By setting the .projection(projection) we ensure that the path data is calculated according
  // to the Robinson projection set above. No .context() call required; hexgrid() sets its own
  // Canvas context.
  console.log('..setting geoPath');
  const geoPath = d3.geoPath() // svg.append("path").attr("d", d3.geoPath());
    .projection(this.projection);

  // Iterate over our array of points, "projecting" these geographical coordinates
  // onto the 2D canvas using the Robinson projection to determine their corresponding (x, y) positions
  // on the screen. This processing is essential for accurately placing these points 
  // on the canvas based on their real-world locations.
  console.log('..determing x/y of each point according to projection');
  this.points.forEach((site) => {
    const coords = this.projection([+site.lng, +site.lat]);
    site.x = coords[0];
    site.y = coords[1];
  });

  // Hexgrid generator.
  console.log('..configuring hexgrid');
  const hexgrid = d3
    .hexgrid()
    .extent([docWidth, docHeight])
    .geography(this.world)
    .projection(this.projection)
    .pathGenerator(geoPath)
    .hexRadius(3);

  // Hexgrid instance.
  // userVariables=['core'] copies the 'core' property to hex.grid.layout (per point)
  // depends on custom modifications to d3-hexgrid.js to merge 'core' -> 'net'
  console.log('..suppling hexgrid with point data');
  this.hex = hexgrid(this.points, ['core']);

  // Defines a new path for a hexagon shape
  console.log('..defining hexagon');
  this.hexagon = new Path2D(this.hex.hexagon());
  this.hexedge = new Path2D(this.hex.hexagon(3.5));

  // Minimum zoom: document height matches the viewport height (dynamic)
  const minZoom = height / docHeight;

  // Attach zoom handler
  if (!this.d3zoom) {
    // Only create this once, so it keeps its state (pan and zoom)
    // while we resize the browser window.
    this.d3zoom = d3
      .zoom()
      .extent(()=>[[0,0],[this.width,this.height]]) // viewport (function)
      .translateExtent([[0,0],[docWidth,docHeight]]) // world extent
      .scaleExtent([minZoom, 8])
      .on("zoom", this.handleZoom);
    this.canvas.call(this.d3zoom);
    this.d3zoom.scaleTo(this.canvas, minZoom);
    this.zoom = minZoom;
  }

  // Color scale.
  // This property represents kind of weight or count of data points
  // within each hexagon, and the filter removes any hexagons without data points.
  console.log('..performing statistical clustering');
  const counts = this.hex.grid.layout
    .map((el) => el.datapointsWt)
    .filter((el) => el > 0);

  // This section checks if there are enough data points for meaningful
  // clustering (at least 4 clusters to match the colour range.)
  // If we have less than 4 points, reduce the number of clusters to
  // match (degenerate cases.)
  const optimalClusters = Math.min(counts.length, 4);

  // If we have at least one point, use ss.ckmeans (vendor/@simple-statistics)
  // to perform statistical clustering on the data points, dividing them 
  // into [up to] 4 clusters, and extracting the smallest value from each
  // cluster to serve as thresholds for the color scale.
  // If we have no points, use a single threshold of 1 (degenerate case.)
  const ckBreaks = counts.length > 0 ?
    ss.ckmeans(counts, optimalClusters).map((clusters) => clusters[0]) : [1];

  // This code sets up a threshold color scale using D3.
  // The domain of the scale is set to the break points calculated
  // by the ckmeans clustering, and the range is an array of color values.
  // This color scale will be used to color the hexagons based on their data weight.
  // We use two color scales, one for Core nodes and one for DogeNet nodes.
  console.log('..adjusting colours per clustering');
  const coreThreshold = d3
    .scaleThreshold()
    .domain(ckBreaks)
    .range(["#444444", "#F0BE5F", "#ECB23B", "#EF9907", "#C56B00"]);
  const netThreshold = d3
    .scaleThreshold()
    .domain(ckBreaks)
    .range(["#444444", "#BEF05F", "#B2EC3B", "#99EF07", "#6BC500"]);
  this.color = function(hex) {
    const w = hex.datapointsWt;
    return hex.net ? netThreshold(w) : coreThreshold(w);
  }

  // We clustered, lets draw.
  console.log('Setup complete, now Drawing.');
  console.groupEnd();
  this.draw();
}

export function resize () {
  console.group('+++ HexMap resize..');

  // Set the height and width to whatever the the dimensions of the host element are.
  const { width, height } = this.getBoundingClientRect();
  if (width <= 0 || height <= 0) return; // BUG: sometimes (0,0) which crashes.

  this.width = width;
  this.height = height;
  this.pixelRatio = window.devicePixelRatio || 1;

  // Resize canvas.
  this.canvas
    .attr("width", this.width * this.pixelRatio)
    .attr("height", this.height * this.pixelRatio)
    .style("width", this.width + 'px')
    .style("height", this.height + 'px');

  // Set the rendering context scale to match the pixel density 
  // of the user's device to ensure a clear image.
  this.renderingContext.resetTransform();
  this.renderingContext.scale(this.pixelRatio, this.pixelRatio);

  // Minimum zoom: document height matches the viewport height (dynamic)
  const minZoom = height / docHeight;

  // Update the scale extent on resize, so the fully zoomed out document
  // vertically fills the entire viewport.
  this.d3zoom.scaleExtent([minZoom, 8]);

  if (this.zoom < minZoom) {
    // Must zoom in so the document vertically fills the viewport.
    this.d3zoom.scaleTo(this.canvas, minZoom);
    this.zoom = minZoom;
  }

  console.log('Resize complete, now Drawing.');
  console.groupEnd();
  this.draw();
}

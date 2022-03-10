// The svg
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();

// Load external data and boot
d3.queue()
  .defer(d3.json, "choropleth.geojson")
  .defer(d3.csv, "dataSetChoropleth.csv", function(d) { data.set(d.code, +d.index); })
  .await(ready);

function ready(error, topo) {
  
  const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step))

  let intervals = 5;
  let minValue = d3.min(topo.features, function(d) { return d.total = data.get(d.id) || 0});
  let maxValue = d3.max(topo.features, function(d) { return d.total = data.get(d.id) || 0});
  let steps  = (maxValue-minValue)/intervals;
  var domainArray = range(minValue, maxValue+1, steps);

  var colorScale = d3.scaleThreshold()
  .domain(domainArray)
  .range(d3.schemeBlues[intervals+1]);

  //Legenda
  var g =  svg.append("g")
      .attr("class",  "legendThreshold")
      .attr("transform", "translate(20,20)");
  g.append("text")
      .attr("class",  "caption")
      .attr("x", 0)
      .attr("y", -6)
      .text("Gender Inequality Index 2016");
  var labels = domainArray.map((value, index,) => {
    if (index < domainArray.length-1) {
      return value.toFixed(1) + ' - ' + domainArray[index+1].toFixed(1);
    }
    return '> ' + value.toFixed(1);
  })
  var legend = d3.legendColor()
    .labels(function(d) { return labels[d.i]; })
    .shapePadding(1)
    .scale(colorScale);
  svg.select(".legendThreshold")
    .call(legend);

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      });

  

}
// create the svg area
var svg = d3.select("#my_chords")
  .append("svg")
    .attr("width", 660)
    .attr("height", 660)
  .append("g")
    .attr("transform", "translate(320,320)")

// Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
// Its opacity is set to 0: we don't see it by default.
var tooltip = d3.select("#my_chords")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "fixed")
    .style("top", "200px")
    .style("left", "700px")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

// 4 groups, so create a vector of 4 colors
var colors = [
    '#FF6633af', '#FFB399af', '#FF33FFaf', '#FFFF99af', '#00B3E6af', 
	'#E6B333af', '#3366E6af', '#999966af', '#99FF99af', '#B34D4Daf',
	'#80B300af', '#809900af', '#E6B3B3af', '#6680B3af', '#66991Aaf', 
	'#FF99E6af', '#CCFF1Aaf', '#FF1A66af', '#E6331Aaf', '#33FFCCaf',
	'#66994Daf', '#B366CCaf', '#4D8000af', '#B33300af', '#CC80CCaf', 
	'#66664Daf', '#991AFFaf', '#E666FFaf', '#4DB3FFaf', '#1AB399af',
	'#E666B3af', '#33991Aaf', '#CC9999af', '#B3B31Aaf', '#00E680af', 
	'#4D8066af', '#809980af', '#E6FF80af', '#1AFF33af', '#999933af',
	'#FF3380af', '#CCCC00af', '#66E64Daf', '#4D80CCaf', '#9900B3af', 
    '#E64D66af', '#4DB380af', '#FF4D4Daf', '#99E6E6af', '#6666FFaf',
    "#440154af", "#31668daf", "#37b578af", "#fde725af","#24a19faf", 
    "#e1668daf", "#8775a8af", "#f027e5af"
];

// Fetches + munges data
// note: assumes that cellData fills matrix row-wise
function getData(callback) {
    d3.csv("dataSetChords.csv", function(error, cellData) {
      if (error) {
        console.error(error);
      }

      var nCells       = cellData.length;
      var nUniqueNodes = Math.sqrt(nCells);

      if (nUniqueNodes % 1 !== 0) {
        console.error("Matrix shape must be square!");
      }

      var matrix      = []; 
      var labels      = [];

      var cellIndex = 0;
      var currCell;

      d3.range(nUniqueNodes).forEach(function(row) {

        matrix[row] = [];

        d3.range(nUniqueNodes).forEach(function(column) {

          currCell   = cellData[cellIndex++];
          currCell.z = +(currCell.z);
          matrix[row][column] = currCell.z;
        });

        labels[row] = currCell.source_country;
      });

      callback({ matrix, labels });
    });
};

function makeVis(data) {
    console.log(data);

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (data.matrix)

    // add the groups on the outer part of the circle
    svg
        .datum(res)
        .append("g")
        .selectAll("g")
        .data(function(d) { return d.groups; })
        .enter()
        .append("g")
        .append("path")
        .style("fill", function(d,i){ return colors[i] })
        .style("stroke", "black")
        .attr("d", d3.arc()
            .innerRadius(300)
            .outerRadius(310)
        )

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var showTooltip = function(d) {
        console.log(data.labels[d.source.index], data.labels[d.target.index], data.labels[d.source.z]);
        tooltip
            .style("opacity", 1)
            .html("Source: " + data.labels[d.source.index] + "<br>Target: " + data.labels[d.target.index] + "<br>Value: " + data.labels[d.source.z])
    }

    // Add the links between groups
    svg
        .datum(res)
        .append("g")
        .selectAll("path")
        .data(function(d) { return d; })
        .enter()
        .append("path")
        .attr("d", d3.ribbon()
            .radius(300)
        )
        .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("stroke", "transparent")
        .on("mouseover", showTooltip );
}

getData(/*callback=*/makeVis);


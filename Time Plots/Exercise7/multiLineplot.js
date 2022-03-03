// // set the dimensions and margins of the graph
// var margin = {top: 10, right: 30, bottom: 30, left: 60},
//     width = 1500 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;

// // append the svg object to the body of the page
// var svg = d3.select("#my_multi_lineplot")
//   .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");

// //Read the data
// d3.csv("dataSetMultiLineplot.csv", function(data) {

//   var countries = data.columns.slice(1).map(function(id) {
//     return {
//       id: id,
//       values: data.map(function(d) {
//         return {date: d.year, value: d[id]};
//       })
//     };
//   });

//   // group the data: I want to draw one line per group
//   // var countries = d3.nest() // nest function allows to group the calculation per level of a factor
//   //   .key(function(d) { return d.countries;})
//   //   .entries(data);

//   // Add X axis --> it is a date format
//   var x = d3.scaleLinear()
//     .domain(d3.extent(data, function(d) { return d.year; }))
//     .range([ 0, width ]);
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x).ticks(42));

//   // Add Y axis
//   var y = d3.scaleLinear()
//     .domain([0, d3.max(data, function(d) { return +d.Business; })])
//     .range([ height, 0 ]);
//   svg.append("g")
//     .call(d3.axisLeft(y));

//   // color palette
//   var res = countries.map(function(d){ return d.key }) // list of group names
//   var color = d3.scaleOrdinal()
//     .domain(res)
//     .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

//   // Draw the line
//   svg.selectAll(".line")
//       .data(countries)
//       .enter()
//       .append("path")
//         .attr("fill", "none")
//         .attr("stroke", function(d){ return color(d.key) })
//         .attr("stroke-width", 1.5)
//         .attr("d", function(d){
//           return d3.line()
//             .x(function(d) { return x(d.year); })
//             .y(function(d) { return y(+d.value); })
//             (d.values)
//         })

// })

var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

d3.tsv("oldData.tsv", type, function(error, data) {
  if (error) throw error;

  var cities = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, temperature: d[id]};
      })
    };
  });

  x.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.date; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.date; }); })
  ]);

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.temperature; }); })
  ]);

  z.domain(cities.map(function(c) { return c.id; }));

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Value");

  var city = g.selectAll(".city")
    .data(cities)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

  city.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });
});

function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}
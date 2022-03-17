var originalData = null;
var width = 900, height = 750;

var column = [
    { key: 'IDEB', value: 'valor' }
];

var day = "2020-04-14";

var map = d3.select("#map-container")
    .attr("id", "map")
    .attr("width", width)
    .attr("height", height);

var topo;

var edos = map.append("g")
    .attr("id", "edos")
    .selectAll("path");

var proj = d3.geo.mercator()
    .center([-50, -8.5])
    .scale(1000);

var carto = d3.cartogram()
    .projection(proj)
    .properties(function (d) {
        return d.properties;
    });

var topology, geometry;

function configure() {
    originalData = originalData.map(function (row) {
        row.estado = converterEstados(row.estado);
        return row;
    });

    const days = d3.nest()
        .key(function (d) { return d.data; })
        .entries(originalData);

    d3.select("#days").selectAll("option")
        .data(days)
        .enter()
        .append("option")
        .text(function (d) { return d.key; })
        .attr("value", function (d) { return d.key; });

    d3.select("#column").selectAll("option")
        .data(column)
        .enter()
        .append("option")
        .text(function (d) { return d.key; })
        .attr("value", function (d) { return d.value; });
}

function makeMap(data) {
    topology = data;
    geometries = data.objects.states.geometries;
    var features = carto.features(data, geometries),
        path = d3.geo.path()
            .projection(proj);

    edos = edos.data(features)
        .enter()
        .append("path")
        .attr("class", "states")
        .attr("id", function (d) {
            return converterEstados(d.properties.name);
        })
        .attr("d", path);
            
     update();
};

function update() {
    // Filtrar por data
    day = document.getElementById("days").value;
    data = originalData.filter(d => d.data === day);

    // Filtrar por coluna
    column = document.getElementById("column").value;
    data = data.map(d => {
        return {
            state: d.estado,
            value: d[column]
        }
    });
    doUpdate();
}

function doUpdate() {
            
    var data = originalData.filter(d => d.data === day);
    data = data.map(d => {
        return {
            state: d.estado,
            value: d[column]
        }
    });

    var color = d3.scale.linear()
        .domain([0, d3.max(data, d => +d.value)])
        .range([0, 1]);
            

    var scale = d3.scale.linear()
        .domain([0, d3.max(data, d => +d.value)])
        .range([1, 1000]);

    carto.value(function (d) {
        var dayData = data.find(x => x.state == d.properties.name);
            return + scale(dayData.value)
    });

    var carto_features = carto(topology, geometries).features;
    edos.data(carto_features);

    edos.transition()
        .duration(900)
        .attr("d", carto.path);

    data.forEach(d => {
        d3.select(`#${converterEstados(d.state)}`)
            .style('fill', d3.interpolateBlues(color(d.value)));
    });
            
};

d3.dsv(';')("cartogram.csv", function (error, data) {
    originalData = data;
    configure();
    d3.json("br-states.json", function (mapData) {
        makeMap(mapData)
    });
});
// helper function csv2json to return json data from csv
function csv2json(csv) {
    // csv = csv.replace(/, /g, ","); // trim leading whitespace in csv file
    // var json = d3.csv.parse(csv); // parse csv string into json
    var json = csv;
    // reshape json data
    var data = [];
    var groups = []; // track unique groups
    json.forEach(function(record) {
      var group = record.group;
      if (groups.indexOf(group) < 0) {
        groups.push(group); // push to unique groups tracking
        data.push({ // push group node in data
          group: group,
          axes: []
        });
      };
      data.forEach(function(d) {
        if (d.group === record.group) { // push record data into right group in data
          d.axes.push({
            axis: record.axis,
            value: parseInt(record.value),
            description: record.description
          });
        }
      });
    });
    return data;
}

var width = 400,
    height = 400;

var config = {
    w: width,
    h: height,
    maxValue: 74.8
}

d3.csv("dataSetRadar.csv", function(data) {
    var data = csv2json(data);
    RadarChart.draw("#my_radar", data, config);
});

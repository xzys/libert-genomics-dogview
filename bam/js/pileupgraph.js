var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");



var line = d3.svg.line()
    .x(function(d) { return x(d.i); })
    .y(function(d) { return y(d.n); });

var lines = [];

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var index = d3.select("body").append("div")
    .attr("class", "index")
  .append("div")
    .attr("stroke", "#fff")
    .attr("onmouseover", "unhighlight(this)")
    .html("clear")

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

var colors = ["steelBlue", "tomato"],
    cindex = 0;

var decode = function(error, data) {
  var i = 0;
  data.forEach(function(d) {
    d.i = i++;
  });

  // add line
  lines.push(d3.svg.area()
    .x(function(d) { return x(d.i); })
    .y0(height)
    .y1(function(d) { return y(d.n); }));

  // x.domain([0, d3.max(data, function(d) { return d.i })]);
  x.domain([0, 2000]);
  y.domain(["0", "80"]);
  var fn = files[file_index].match(/.+\/(.+)\.tsv/)[1];

  d3.select(".index").append("div")
      .style("background-color", colors[cindex % colors.length])
      .attr("onmouseover", "highlight(this)")
      .text(fn);

  svg.select(".x.axis")
      .transition().duration(400)
      .call(xAxis);
  svg.select(".y.axis")
      .transition().duration(400)
      .call(yAxis);

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("id", fn)
      .style("stroke", colors[cindex % colors.length])
      .style("fill", colors[cindex++ % colors.length])
      .attr("d", lines[lines.length - 1]); // last line added
  file_index++;
};

// highlight the area of this path and not others
function highlight(div) {
  svg.selectAll(".line")
      .transition().duration(200)
      .style("fill-opacity", "0.0");
  svg.selectAll("#" + div.innerHTML)
      .transition().duration(200)
      .style("fill-opacity", "0.8");
}

function unhighlight(div) {
  svg.selectAll(".line")
      .transition().duration(200)
      .style("fill-opacity", "0.0");
}


var files = ['data/seq1.tsv', 'data/seq2.tsv'],
    file_index = 0;
for(var i = 0;i < files.length;i++) {
  d3.tsv(files[i], decode);
}

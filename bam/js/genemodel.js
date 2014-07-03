var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.linear().range([0, width]),
    y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);



var rcolors = ["rgb(255, 0, 0)", "rgb(0, 0, 255)"];

function update(data) {
	var reads = svg.selectAll("reads").data(data);

	// reads.enter().append("line")
	// 		.attr("x1", function(d) { return x(d.start); })
	// 		.attr("y1", function(d) { return y(d.h); })
	// 		.attr("x2", function(d) { return x(d.start); })
	// 		.attr("y2", function(d) { return y(d.h); })
	// 		.style("stroke", function(d) { return ((d.read1 == "True") ? rcolors[0] : rcolors[1]); })
	// 		.style("stroke-width", "2")
	// 	.transition().duration(500)
	// 		.delay(function(d, i) { return i * 0.5; })
	// 		.attr("x2", function(d) { return x(d.end); });

	reads.enter().append("line")
			.attr("x1", function(d) { return x(d.start); })
			.attr("y1", function(d) { return height; })
			.attr("x2", function(d) { return x(d.end); })
			.attr("y2", function(d) { return height; })
			.style("stroke", function(d) { return ((d.read1 == "True") ? rcolors[0] : rcolors[1]); })
			.style("stroke-width", "2")
		.transition()
			.duration(300)
			.delay(function(d, i) { return i * 3; })
			.attr("y1", function(d) { return y(d.h); })
			.attr("y2", function(d) { return y(d.h); });

	svg.select(".x.axis")
      .transition().duration(500)
      .call(xAxis);
  svg.select(".y.axis")
      .transition().duration(500)
      .call(yAxis);
}

function decode(error, data) {
	// make pileup
	var processed = 0,
			max_h = 0;
	data.forEach(function(d){
		var h = 0;
		while(1) {
			var hit = false;
			for(var i=0; i < processed;i++) {
				// if overlap
				if(data[i].h == h && (Math.max(d.start, data[i].start) < Math.min(d.end, data[i].end))) {
					hit = true;
					break;
				}
			}

			if(hit) {
				h++;				
			} else {
				break;
			}
		}
		if(h > max_h) max_h = h;
		processed++;
		d.h = h;
	});



  x.domain([0, 2000]);
	y.domain([0, max_h]);

	console.log(d3.max(data, function(d) { return d.end }));
	console.log(y);

  update(data);
}

d3.tsv('data/seq1reads.tsv', decode);
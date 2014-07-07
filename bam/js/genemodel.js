var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    genemodel_height = 120;

var rcolors = ["rgb(255, 0, 0)", "rgb(0, 0, 255)", "rgb(100, 100, 100)", "rgb(0, 0, 0)", "#555"];

var x = d3.scale.linear().range([0, width]),
    y = d3.scale.linear().range([height - genemodel_height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var gene_model_index,
		gene_start = 0,
		gene_end = 0;
;

var lines = [],
    line = d3.svg.line()
    .x(function(d) { return x(d.i); })
    .y(function(d) { return y(d.n); });


/* INITIALIZE SVG STUFF */
// var svg = d3.select("body").append("svg")
d3.select("#svg-container").append("svg")
		.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svg = d3.select("svg g");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  .append("text")
  	.attr("dy", 16)
  	.attr("dx", 10)
  	.text("bp -- base pairs");

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

svg.append("rect")
		.attr("class", "introns")
		.attr("width", width)
		.attr("height", 10)
		.attr("x", 0)
		.attr("y", height - genemodel_height + 20)
		.style("fill", rcolors[4]);

var index = d3.select("body").append("div")
    .attr("class", "index")
  .append("div")
    .attr("stroke", "#fff")
    .attr("onmouseover", "unhighlight(this)")
    .html("clear")


var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("visibility", "hidden");

function reset_axes() {
	svg.select(".x.axis")
      .transition().duration(500)
      .call(xAxis);
	svg.select(".y.axis")
      .transition().duration(500)
      .call(yAxis);
}

var colors = ["steelBlue", "tomato"],
    cindex = 0;


/* algorithm for stacking reads on top of reach other so they don't colide */
function stacker(d, i, data) {
	var h = 0;
	while(1) {
		var hit = false;
		for(var j=0; j < i;j++) {
			// if overlap
			if(data[j].h == h && (Math.max(d.start, data[j].start) < Math.min(d.end, data[j].end))) {
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

	d.h = h;
}

/* ANALYZE PILEUPS */
function decode_pileups(error, data) {
	var i = 0;
  data.forEach(function(d) {
    d.i = i++;
  });
  x.domain([0, 2000]);
  y.domain(["0", "80"]);
	// naw
	update_pileups(data);
};

function update_pileups(data) {
	// add line
	var fn = files[file_index].match(/.+\/(.+)\.tsv/)[1];

  lines.push(d3.svg.area()
      .x(function(d) { return x(d.i); })
      .y0(height - genemodel_height)
      .y1(function(d) { return y(d.n); }));

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
}

/* ANALYZE READS */
function decode_reads(error, data) {
	// make pileup
	data.forEach(stacker);

	x.domain([0, 2000]);
	y.domain([0, d3.max(data, function(d) { return d.h; })]);

	update_reads(data);
}

function update_reads(data) {
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
			.attr("class", "read")
			.attr("x1", function(d) { return x(d.start); })
			.attr("y1", function(d) { return height - genemodel_height; })
			.attr("x2", function(d) { return x(d.end); })
			.attr("y2", function(d) { return height - genemodel_height; })
			.style("stroke", function(d) { return ((d.read1 == "True") ? rcolors[0] : rcolors[1]); })
			.style("stroke-width", "2")
			.style("opacity", "0")
		.transition()
			.duration(300)
			.delay(function(d, i) { return i * 3; })
			.attr("y1", function(d) { return y(d.h); })
			.attr("y2", function(d) { return y(d.h); })
			.style("opacity", "1")

	reset_axes();	
}

/* ANALYZE GENEMODEL */
function decode_genemodel(error, data) {
	// data.forEach(stacker);
	// console.log(data);

	// x.domain([0, 2000]);
	update_genemodel(data);
}

function update_genemodel(data) {
	// clear all first
	svg.selectAll(".gene-node").remove();

	// load new
	var genes = svg.selectAll("gene-node")
			.data(data)
			.enter()
		.append("g")
			.attr("class", "gene-node")
			.on("mouseover", function() { 
				return d3.select(this).select("text").transition()
						// .style("background", "#444")
						.style("opacity", "1");
			})
			.on("mouseout", function() { 
				return d3.select(this).select("text").transition()
				// .style("background", "rgba(255, 255, 255, 0)")
				.style("opacity", "0.2"); 
			});

	
	genes.append("rect")
			.attr("width", function(d) { return x(d.end - d.start); })
			.attr("x", function(d) { return x(d.start - gene_start); })
			.attr("height", function(d) { return 20; })
			.attr("y", function(d) { return height - genemodel_height + 15; })
			.style("fill", function(d) {
				switch(d.type) {
					case 'exon':
						return rcolors[0];
					case 'CDS':
						return rcolors[1];
					case 'stop_codon':
						return rcolors[2];
					case 'Start_codon':
						return rcolors[3];
				}
			});
	
	genes.append("text")
			// .attr("x", function(d) { return x(d.start - gene_start); })
			// .attr("y", function(d) { return height - genemodel_height + 55 + d.h * 10; })
			// .attr("y", function(d) { return height - genemodel_height + 55; })
			.attr("transform", function(d) {
				// return "translate(" + (x(d.start - gene_start)) + ", " + (height - genemodel_height + 55 ) + ")"; 
				return "translate(" + (x(d.start - gene_start)) + ", " + (height - genemodel_height + 55 ) + ")" +
							 "rotate(90)"; 
			})
			.style("opacity", "0.2")
			.text(function(d) { return d.type; });

	reset_axes();
	// .on("mousemove", function(d){
	// 	return tooltip.style("top", height - genemodel_height + 70 + "px")
	// 								.style("left", margin.left + x(d.start - gene_start) + "px")
	// 								.html('<strong>' + d.type + '</strong><p>' + d.start + ' - ' + d.end + '</p>');
	// });
	// .style("stroke", "black")
	// .style("stroke-width", "1");
}

/* ANALYZE GENEMODEL INDEX */
function decode_geneindex(error, data) {
	data.forEach(function(d) {
		if(d.gene_id.substring(0, 3) != 'LOC') {
			search.options.push(d.gene_id);
		}
	});

	gene_model_index = data;
}






/* LISTENERS */
d3.select(window).on("resize", resize);
function resize() {
	// this container will match width of window
	var container = d3.select("#svg-container");
	width = parseInt(container.style("width")) - margin.left - margin.right;
	
  d3.select("svg").attr("width", parseInt(container.style("width")));
	x.range([0, width]);

	reset_axes();

  svg.select(".introns")
  		.attr("width", width);

 	svg.selectAll(".gene-node rect").transition()
 			.attr("width", function(d) { return x(d.end - d.start); })
			.attr("x", function(d) { return x(d.start - gene_start); });
  svg.selectAll(".gene-node text").transition()
 			.attr("transform", function(d) {
				// return "translate(" + (x(d.start - gene_start)) + ", " + (height - genemodel_height + 55 ) + ")"; 
				return "translate(" + (x(d.start - gene_start)) + ", " + (height - genemodel_height + 55 ) + ")" +
							 "rotate(90)"; 
			});

 	svg.selectAll(".read").transition()
			.attr("x1", function(d) { return x(d.start); })
			.attr("x2", function(d) { return x(d.end); });
}

// highlight the area of this path and not others
function highlight(div) {
  svg.selectAll(".line")
      .transition().duration(200)
      .style("fill-opacity", "0.0");
  svg.selectAll("#" + div.innerHTML)
      .transition().duration(200)
      .style("fill-opacity", "0.8");
}
// unhighlight whichover paths
function unhighlight(div) {
  svg.selectAll(".line")
      .transition().duration(200)
      .style("fill-opacity", "0.0");
}




var search = completely(document.getElementById("searchbox"), {
	display : 'inline',
	fontSize : '13px',

});

search.onEnter = function() {
	var text = search.getText();
	gene_end = null;
	for(var i=0;i < gene_model_index.length;i++) {
		if(gene_model_index[i].gene_id == text) {
			gene_start = gene_model_index[i].start;
			gene_end = gene_model_index[i].end;
			// console.log('found');
			break;
		}
	}

	if(gene_end != null) {
		x.domain([0, gene_end - gene_start]);
		d3.tsv('data/models/' + text + '.model', decode_genemodel);
		
	} else {
		alert('No gene found with name: ' + text);
	}
}

setTimeout(function() {	search.input.focus(); },0);



/* INITIAL DATA */
var files = ['data/seq1.tsv', 'data/seq2.tsv'],
    file_index = 0;



d3.tsv('data/reads/seq1.reads.tsv', decode_reads);
d3.tsv('data/gene_model_index', decode_geneindex);
d3.tsv('data/pileups/seq1.tsv', decode_pileups);
resize();

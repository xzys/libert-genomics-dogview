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

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
		.attr("width", width)
		.attr("height", 10)
		.attr("x", 0)
		.attr("y", height - genemodel_height + 20)
		.style("fill", rcolors[4]);


var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("visibility", "hidden")




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



function decode_reads(error, data) {
	// make pileup
	data.forEach(stacker);

	// x.domain([0, 2000]);
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
			.attr("x1", function(d) { return x(d.start); })
			.attr("y1", function(d) { return height - genemodel_height; })
			.attr("x2", function(d) { return x(d.end); })
			.attr("y2", function(d) { return height - genemodel_height; })
			.style("stroke", function(d) { return ((d.read1 == "True") ? rcolors[0] : rcolors[1]); })
			.style("stroke-width", "5")
			.style("opacity", "0")
		.transition()
			.duration(300)
			.delay(function(d, i) { return i * 3; })
			.attr("y1", function(d) { return y(d.h); })
			.attr("y2", function(d) { return y(d.h); })
			.style("opacity", "1")

	svg.select(".x.axis")
      .transition().duration(500)
      .call(xAxis);
	svg.select(".y.axis")
      .transition().duration(500)
      .call(yAxis);
}

function decode_genemodel(error, data) {
	data.forEach(stacker);
	// console.log(data);

	gene_start = 600803;
	gene_end = 635338;

	x.domain([0, gene_end - gene_start]);
	// x.domain([0, 2000]);
	update_genemodel(data);
}

var gene_start = 0,
		gene_end = 0;

function update_genemodel(data) {
	

	var genes = svg.selectAll("gene-node")
			.data(data)
			.enter()
			.append("g")
			.on("mouseover", function(){ return d3.select(this).select("text").transition().style("opacity", "1");})
			.on("mouseout", function(){ return d3.select(this).select("text").transition().style("opacity", "0.2"); });
	
	genes.append("rect")
			.attr("width", function(d) { return x(d.end - d.start); })
			.attr("height", function(d) { return 20; })
			.attr("x", function(d) { return x(d.start - gene_start); })
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
			// .attr("transform", "rotate(20)")
			.text(function(d) { return d.type; });
	svg.select(".x.axis")
      .transition().duration(500)
      .call(xAxis);
	svg.select(".y.axis")
      .transition().duration(500)
      .call(yAxis);
	// .on("mousemove", function(d){
	// 	return tooltip.style("top", height - genemodel_height + 70 + "px")
	// 								.style("left", margin.left + x(d.start - gene_start) + "px")
	// 								.html('<strong>' + d.type + '</strong><p>' + d.start + ' - ' + d.end + '</p>');
	// });
	// .style("stroke", "black")
	// .style("stroke-width", "1");
}


d3.tsv('data/models/ADNP2.model', decode_genemodel);
d3.tsv('data/reads/seq1.reads.tsv', decode_reads);
// d3.tsv('data/gene_model_index', decode_geneindex);

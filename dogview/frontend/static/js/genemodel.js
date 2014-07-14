var margin = {top: 20, right: 20, bottom: 10, left: 50},
    width = 1600 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom,
    genemodel_height = 130;

var rcolors = ["red",
							 "blue",
							 "rgb(100, 100, 100)",
							 "rgb(0, 0, 0)",
							 "rgb(150, 150, 150)"];

var colors = ["steelBlue", "tomato"],
    cindex = 0;



var x = d3.scale.linear().range([0, width]),
    y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


// eventually this will be its own d3 data bound element
var specimens = [
								 // 'accepted_hits_1_old.bam',
								 'accepted_hits_2_old.bam',
								 'accepted_hits_2_old.bam',
								 // 'accepted_hits_3_young.bam',
								 // 'accepted_hits_4_young.bam'
								];

/* INITIALIZE SVG STUFF */
// make a graph for each specimen we have loaded
var read_graphs = []
cindex = 0;
specimens.forEach(function(s) {
	var name = s.replace('.bam', '')
							.replace('accepted_hits_', '')
							.replace('_', '');

	d3.select("#specimen-select").append("div")
			.attr("class", "specimen")
			.style("background", colors[cindex++ % colors.length])
			.style("opacity", "0.6")
			.attr("value", s) // full name
			.html(name);

	d3.select("#svg-container").append("svg")
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
  	.attr("class", "read-graph")
  	.attr("id", "s" + name)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .append("g")
    .attr("class", "y axis")
    .call(yAxis);;

  read_graphs.push(d3.select("#s" + name));
});
// var svg = d3.select("svg g");


d3.select("#svg-container").append("svg")
    .attr("height", genemodel_height + margin.top + margin.bottom)
  .append("g")
  	.attr("id", "gm-graph")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var gm_graph = d3.select("#gm-graph");



gm_graph.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (genemodel_height - 10) + ")")
    .call(xAxis)
  .append("text")
  	.attr("dy", 16)
  	.attr("dx", 10)
  	.text("bp -- base pairs");

gm_graph.append("rect")
		.attr("class", "introns")
		.attr("width", width)
		.attr("height", 10)
		.attr("x", 0)
		.attr("y", 20)
		.style("fill", rcolors[4]);



// var index = d3.select(".inputbox-container").append("div")
//     .attr("class", "inputbox")
//   .append("div")
//     .attr("stroke", "#fff")
//     .attr("onmouseover", "unhighlight(this)")
//     .html("clear")


var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("visibility", "hidden");



function reset_axes() {
	gm_graph.select(".x.axis")
      .transition().duration(500)
      .call(xAxis);
	d3.selectAll(".y.axis")
      .transition().duration(500)
      .call(yAxis);
}

var gene_model_index,
		gene_name = '',
		gene_start = 0,
		gene_end = 0,
		gene_chrom = '';














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

/* because d3's max thing sucks */ 
function get_actual_max(data, accessor) {
	var max = 0;
	data.forEach(function(d) { max = Math.max(d[accessor], max); })
	return max;
}

/* ANALYZE PILEUPS */
function decode_pileups(error, data) {
  data.forEach(function(d, i) {
    d.i = i;
  });
 	// console.log(data);
	update_pileups(data);
};

function update_pileups(data) {
	// d3.select(".index").append("div")
	//      .style("background-color", colors[cindex % colors.length])
	//      .attr("onmouseover", "highlight(this)")
	//      .text(specimens[0]);

	var svg = d3.select("#s" + data[0].sample);
	// console.log(d3.select("#s" + data[0].sample));

	var pileups = svg.selectAll('.pileup').data(data);

	// pileups.enter().append('path')
	// 		.datum(data)
 //      .attr("class", "pileup")
 //      .attr("id", specimens[0])
 //      .style("stroke", colors[cindex % colors.length])
 //      .style("fill", colors[cindex++ % colors.length])
 //      .attr("d", 
 //      	d3.svg.area()
	// 		      .x(function(d) { return x(d.i); })
	// 		      .y0(height - genemodel_height)
	// 		      .y1(function(d) { return y(d.n); })
 //      ); // last line added

 //  pileups.exit().remove();

  // y.domain([0, Math.max(20, d3.max(data, function(d) { return d.n; }))]);
  y.domain([0, Math.max(20, get_actual_max(data, 'n'))]);
  
  svg.append("path")
      .datum(data)
      .attr("class", "pileup")
      .attr("id", specimens[0])
      .style("stroke", colors[cindex % colors.length])
      .style("stroke-width", "1")
      .style("fill", colors[cindex++ % colors.length])
      .style("fill-opacity", '0')
      .attr("d", 
      	d3.svg.area()
			      .x(function(d) { return x(d.i); })
			      .y0(height)
			      .y1(function(d) { return y(d.n); })
      )
    .transition()
    	.duration(300)
    	.style("fill-opacity", "0.6");

  reset_axes();
}

/* ANALYZE READS */
function decode_reads(error, data) {
	// make pileup
	data.forEach(stacker);

	// y.domain([0, Math.max(100, d3.max(data, function(d) { return d.h; }))]);
	y.domain([0, Math.max(100, get_actual_max(data, 'h'))]);
	update_reads(data);
}

function update_reads(data) {
	var svg = d3.select("#s" + data[0].sample);
	
	svg.selectAll(".read").remove();

	var reads = svg.selectAll(".read").data(data);

	reads.enter().append("line")
			.attr("class", "read")
			.attr("x1", function(d) { return x(d.start - gene_start); })
			.attr("x2", function(d) { return x(d.end - gene_start); })
			.attr("y1", function(d) { return height; })
			.attr("y2", function(d) { return height; })
			.style("stroke", function(d) { return ((d.read1 == "True") ? rcolors[0] : rcolors[1]); })
			.style("stroke-width", "4")
			.style("opacity", "0")
		.transition()
			.duration(200)
			.delay(function(d, i) { return i * 1; })
			.attr("y1", function(d) { return y(d.h); })
			.attr("y2", function(d) { return y(d.h); })
			.style("opacity", "1")

	reads
			.attr("y1", function(d) { return y(d.h); })
			.attr("y2", function(d) { return y(d.h); })
			.attr("x1", function(d) { return x(d.start - gene_start); })
			.attr("x2", function(d) { return x(d.end - gene_start); })
			.style("stroke", function(d) { return ((d.read1 == "True") ? rcolors[0] : rcolors[1]); });
	
	reads.exit().remove();

	reset_axes();	
}

/* ANALYZE GENEMODEL */
function decode_genemodel(error, data) {
	// data.forEach(stacker);
	data.forEach(function(d){
		console.log(d.start + ' ' + d.end + ' ' + d.type);
	})
	update_genemodel(data);
}

function update_genemodel(data) {
	// clear all first
	gm_graph.selectAll(".gene-node").remove();

	// load new
	var genes = gm_graph.selectAll("gene-node")
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
			.attr("y", function(d) { return 15; })
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
			.attr("transform", function(d) {
				// return "translate(" + (x(d.start - gene_start)) + ", " + (height - genemodel_height + 55 ) + ")"; 
				return "translate(" + (x(d.start - gene_start)) + ", " + 55 + ")" +
							 "rotate(90)"; 
			})
			.style("opacity", "0.2")
			.text(function(d) { return d.type; });

	x.domain([0, gene_end - gene_start]);
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
  d3.selectAll("svg").attr("width", parseInt(container.style("width")));
	x.range([0, width]);

	reset_axes();

  gm_graph.select(".introns")
  		.attr("width", width);

 	gm_graph.selectAll(".gene-node rect")
 			.attr("width", function(d) { return x(d.end - d.start); })
			.attr("x", function(d) { return x(d.start - gene_start); });
  gm_graph.selectAll(".gene-node text")
 			.attr("transform", function(d) {
				// return "translate(" + (x(d.start - gene_start)) + ", " + (height - genemodel_height + 55 ) + ")"; 
				return "translate(" + (x(d.start - gene_start)) + ", " + 55 + ")" +
							 "rotate(90)"; 
			});

 	container.selectAll(".read")
			.attr("y1", function(d) { return y(d.h); })
			.attr("y2", function(d) { return y(d.h); })
			.attr("x1", function(d) { return x(d.start - gene_start); })
			.attr("x2", function(d) { return x(d.end - gene_start); });

	container.selectAll(".pileup")
			.attr("d", 
      	d3.svg.area()
			      .x(function(d) { return x(d.i); })
			      .y0(height)
			      .y1(function(d) { return y(d.n); })
      )
}

// highlight the area of this path and not others
function highlight(div) {
  d3.selectAll(".pileup")
      .transition().duration(200)
      .style("fill-opacity", "0.0");
  d3.selectAll("#" + div.innerHTML)
      .transition().duration(200)
      .style("fill-opacity", "0.8");
}
// unhighlight whichover paths
function unhighlight(div) {
  d3.selectAll(".pileup")
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
			gene_name = gene_model_index[i].gene_name;
			gene_chrom = gene_model_index[i].chrom;
			
			// console.log('found' + ' ' + 
			// 						gene_model_index[i].start + ' ' + gene_model_index[i].end + ' ' +
			// 						gene_model_index[i].chrom);
			break;
		}
	}

	console.log(gene_start + ' ' + gene_end);

	if(gene_end != null) {
	// if(false) {
		x.domain([0, gene_end - gene_start]);
		d3.tsv('static/data/models/' + text + '.model', decode_genemodel);

		// d3.tsv('api/reads/?specimen=' + 'accepted_hits_2_old.bam' +
		// 			 ';start=' + gene_start +
		// 			 ';end=' + gene_end + 
		// 			 ';name=' + gene_name +
		// 			 ';chrom=' + gene_chrom, decode_reads);

		d3.selectAll('.pileup').remove(); // temporary
		
		specimens.forEach(function(sample) {
			d3.tsv('api/pileups/?sample=' + sample +
					 ';start=' + gene_start +
					 ';end=' + gene_end + 
					 ';name=' + gene_name +
					 ';chrom=' + gene_chrom, decode_pileups);	
		})
		
			
		// before when I was preprocessing them beforehand
		// d3.tsv('data/genes/' + gene_name + 'reads.tsv', decode_reads);
		
	} else {
		alert('No gene found with name: ' + text);
	}
}

d3.tsv("static/data/gene_model_index", decode_geneindex);
resize();
search.input.focus();
paceOptions = {
  ajax: false, // disabled
  document: false, // disabled
  eventLag: true, // disabled
}
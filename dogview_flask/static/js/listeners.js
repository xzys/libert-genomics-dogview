/* LISTENERS */
d3.select(window).on("resize", resize);
function resize() {
	// this container will match width of window
	var container = d3.select("#svg-container");
	
	width = parseInt(container.style("width")) - margin.left - margin.right;
  d3.selectAll("svg").attr("width", parseInt(container.style("width")));
	
	x.range([0, width]);
	agex.range([0, width]);

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

	container.selectAll(".pileup exons")
			.attr("d", 
      	d3.svg.area()
			      .x(function(d) { return x(d.i); })
			      .y0(height)
			      .y1(function(d) {
			      	return y((d.exon) ? d.n : 0);
			    })
      )
  
  container.selectAll(".pileup introns")
			.attr("d", 
      	d3.svg.area()
			      .x(function(d) { return x(d.i); })
			      .y0(height)
			      .y1(function(d) {
			      	return y((!d.exon) ? d.n : 0);
			    })
      )

  sm_graph.selectAll(".sample")
			.attr("cx", function(d) { return agex(d.age); })
			.attr("cy", function(d) { return exy(d.expression); });
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
	var text = search.getText(),
			found = false;

	for(var i=0;i < gene_model_index.length;i++) {
		if(gene_model_index[i].gene_id == text) {
			gene_name = gene_model_index[i].gene_name;
			gene_chrom = gene_model_index[i].chrom;
			
			found = true;
			break;
		}
	}

	if(found) {
		// wait until you process jene model before you ask for samples
		// this stuff is called after decode genemodel
		d3.tsv('static/models/' + text + '.model', function(error, data) {
			gene_end = null;
			gene_start = null;
			
			// find gene end and start here
			data.forEach(function(d){
				if(gene_end == null || d.end > gene_end) gene_end = d.end;
				if(gene_start == null || d.start < gene_start) gene_start = d.start;

			})

			genemodels = data;
			update_genemodel(data);

			// get expression

			d3.tsv('expressions?gene=' + gene_name, function(error, data) {
				data.forEach(function(d) {
					console.log(d);
					
					// find matching sample
					var sample = null;
					for(var i=0;i < samples.length;i++) {
						if(d.id == samples[i].id) {
							samples[i].expression = d.expression;
						}
					}
				});

				// calc range
				// exy.domain([0, get_actual_max(samples, 'expression')]);
				exy.domain([0, 10]);

				// regraph the top graph
				sm_graph.selectAll(".sample").data(samples)
					.transition()
						.attr("cy", function(d) { return exy(d.expression); });
			})

			// no pileups for now
			// samples.forEach(function(sample) {
			// 	console.log(
			// 			 'api/pileups/?sample=' + sample.filename +
			// 			 ';start=' + gene_start +
			// 			 ';end=' + gene_end + 
			// 			 ';name=' + gene_name +
			// 			 ';chrom=' + gene_chrom);

			// 	d3.tsv('api/pileups/?sample=' + sample.filename +
			// 			 ';start=' + gene_start +
			// 			 ';end=' + gene_end + 
			// 			 ';name=' + gene_name +
			// 			 ';chrom=' + gene_chrom, decode_pileups);
			// })
		});
		

		
		
		// before when I was preprocessing them beforehand
		// d3.tsv('data/genes/' + gene_name + 'reads.tsv', decode_reads);
		
	} else {
		alert('No gene found with name: ' + text);
	}
}

d3.tsv("static/data/gene_model_index", decode_geneindex);
d3.tsv("getkey", decode_key);

resize();
search.input.focus();
paceOptions = {
  ajax: false, // disabled
  document: false, // disabled
  eventLag: true, // disabled
}




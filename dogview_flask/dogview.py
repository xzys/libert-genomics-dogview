from flask import Flask
from flask import render_template
app = Flask(__name__)


import random
import pysam
import pybedtools
import csv
import StringIO
import itertools


# VIEWS

@app.route('/')
def index():
    return render_template('graph.html')

def reads(request):
	"""return reads from start to end"""
	try:
		sample = str(request.GET.get('sample', ''))
		start = int(request.GET.get('start', ''))
		end = int(request.GET.get('end', ''))
		name = str(request.GET.get('name', ''))
		chrom = str(request.GET.get('chrom', ''))

		# bad request
		if end - start > 100000:
			raise ValueError()

		return analyze_reads_from_start(sample, start, end, name, chrom)
	except ValueError as e:
		print e
		return abort("bad params dude")

def pileups(request):
	"""
	same thing really but only get the pileups
	and not reads
	"""
	try:
		sample = str(request.GET.get('sample', ''))
		start = int(request.GET.get('start', ''))
		end = int(request.GET.get('end', ''))
		name = str(request.GET.get('name', ''))
		chrom = str(request.GET.get('chrom', ''))

		if end - start > 100000:
			raise ValueError()

		return analyze_pileups_from_start(sample, start, end, name, chrom)
	except ValueError as e:
		print e
		return abort("bad params dude")

def expressions(request):
	"""
	return a list of all the genes from sample 
	index and their expression values"""
	gene = str(request.GET.get('gene', '')).strip()

	temp = StringIO.StringIO()
	out = csv.writer(temp, delimiter='\t')
	out.writerow(['filename', 'name', 'age', 'gene', 'expression'])

	with open('frontend/static/data/sample_index') as f:
		lines = f.readlines()
		samples = len(lines) - 1

		if gene is not '':
			with open('frontend/static/data/gene_exp.diff') as f:
				# print f.readline()
				# print f.readline().split('\t')[2] == 'PARD6G'
				expressions = next((row.split('\t')[5 + samples:5 + 2 * samples] for row in f 
					   	    		if row.split('\t')[2] == gene), None)

				# this should get the correct values
				# but duoble check with the first line header
				# print row.split('\t')[5 + samples:5 + 2 * samples]


		for i in range(samples):
			pr = lines[i + 1].split('\t')

			if gene is not '' and expressions is not None:
				out.writerow((pr[0], pr[1], int(pr[2]), gene, expressions[i]))
			else:
				out.writerow((pr[0], pr[1], int(pr[2]), 'NA', '0.0'))

	return temp.getvalue()


def refresh_gene_index():
	pass




# PROCESSING FUNCTIONS

def analyze_reads_from_start(sample, start, end, gene, chrom):
	"""
	filter reads based on where this gene 
	starts and ends
	"""

	# load this file
	# try to keep it in memory?
	s = pysam.Samfile('/media/Data/Downloads/real/' + sample, 'rb')

	# WHOATAA THIS IS THE SAME CODE
	shortened = (sample.replace('.bam', '')
					   .replace('accepted_hits_', '')
					   .replace('_', ''))

	# use temporary file instead of saving
	temp = StringIO.StringIO()
	out = csv.writer(temp, delimiter='\t')
	out.writerow(['start', 'end', 'read1', 'sample'])

	
	# alns = s.fetch(chrom, 0, s.lengths[s.gettid(chrom)])
	alns = s.fetch(chrom, start, end)
	
	for aln in alns:
		# if aln.pos > start and aln.pos < end:
		out.writerow([aln.pos, aln.pos + aln.qlen, aln.is_read1, shortened])
		
		print "\033[A                                       \033[A"
		print 'found read @ %d' % aln.pos
		# sys.stdout.flush()

	return temp.getvalue()
	# temp.close()

def analyze_pileups_from_start(sample, start, end, gene, chrom):
	"""
	filter reads based on 
	where this gene starts and ends
	"""

	s = pysam.Samfile('/media/Data/Downloads/real/' + sample, 'rb')
	shortened = (sample.replace('.bam', '')
					   .replace('accepted_hits_', '')
					   .replace('_', ''))

	# use temporary file instead of saving
	temp = StringIO.StringIO()
	out = csv.writer(temp, delimiter='\t')
	out.writerow(['n', 'sample'])

	piles = s.pileup(chrom, start, end)
	print 'starting analyzing pileups'
	
	for pile in piles:
		out.writerow([pile.n, shortened])

	return temp.getvalue()
	# temp.close()








if __name__ == "__main__":
    app.run()

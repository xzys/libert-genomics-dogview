from django.shortcuts import render
from django.http import HttpResponse
import random

# Create your views here.
def index(request):
	return HttpResponse("Hello, world. You're at the index.")

# return reads from start to end
def reads(request):
	try:
		sample = str(request.GET.get('sample', ''))
		start = int(request.GET.get('start', ''))
		end = int(request.GET.get('end', ''))
		name = str(request.GET.get('name', ''))
		chrom = str(request.GET.get('chrom', ''))

		return HttpResponse(analyze_reads_from_start(sample, start, end, name, chrom))
	except ValueError as e:
		print e
		return HttpResponse("bad params dude")
		
def pileups(request):
	try:
		sample = str(request.GET.get('sample', ''))
		start = int(request.GET.get('start', ''))
		end = int(request.GET.get('end', ''))
		name = str(request.GET.get('name', ''))
		chrom = str(request.GET.get('chrom', ''))

		return HttpResponse(analyze_pileups_from_start(sample, start, end, name, chrom))
	except ValueError as e:
		print e
		return HttpResponse("bad params dude")

def expressions(request):
	temp = StringIO.StringIO()
	out = csv.writer(temp, delimiter='\t')
	out.writerow(['filename', 'name', 'age', 'expression'])

	with open('/media/Data/Dropbox/Libert/libert-genomics-pipeline/dogview/frontend/static/data/sample_index') as f:
		lines = f.readlines()
		
		for i in range(1, len(lines)):
			pr = lines[i].split('\t')[:-1]
			pr.append(random.random() * 10)

			out.writerow(pr)

	return HttpResponse(temp.getvalue())







import pysam
import pybedtools
import csv
import StringIO

"""filter reads based on where this gene starts and ends"""
def analyze_reads_from_start(sample, start, end, gene, chrom):
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

"""filter reads based on where this gene starts and ends"""
def analyze_pileups_from_start(sample, start, end, gene, chrom):
	s = pysam.Samfile('/media/Data/Downloads/real/' + sample, 'rb')
	shortened = (sample.replace('.bam', '')
					   .replace('accepted_hits_', '')
					   .replace('_', ''))

	# use temporary file instead of saving
	temp = StringIO.StringIO()
	out = csv.writer(temp, delimiter='\t')
	out.writerow(['n', 'sample'])

	piles = s.pileup(chrom, start, end)
	print 'starting'
	
	for pile in piles:
		out.writerow([pile.n, shortened])

	return temp.getvalue()
	# temp.close()

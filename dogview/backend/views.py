from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
	return HttpResponse("Hello, world. You're at the index.")

# return reads from start to end
def reads(request):
	try:
		start = int(request.GET.get('start', ''))
		end = int(request.GET.get('end', ''))
		name = int(request.GET.get('name', ''))
		chrom = int(request.GET.get('chrom', ''))
		return HttpResponse(analyze_reads_from_start(start, end, name, chrom))
	except ValueError:
		return HttpResponse("bad params dude")
		
	





import pysam
import pybedtools
import csv
import StringIO
"""filter reads based on where this gene starts and ends"""
def analyze_reads_from_start(start, end, gene, chrom):
	# load this file
	# try to keep it in memory?
	s = pysam.Samfile('/media/Data/Downloads/real/accepted_hits_2_old.bam', 'rb')

	# use temporary file instead of saving
	with StringIO.StringIO() as temp:
		out = csv.writer(temp, delimiter='\t')
		out.writerow(['start', 'end', 'read1'])
	
		alns = s.fetch(chrom, 0, s.lengths[s.gettid(chrom)])
	
		for aln in alns:
			if aln.pos > start and aln.pos < end:
				out.writerow([aln.pos, aln.pos + aln.qlen, aln.is_read1])
				
				print "\033[A                                       \033[A"
				print 'found read @ %d' % aln.pos
				sys.stdout.flush()

		return temp.getvalue()
from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
	return HttpResponse("Hello, world. You're at the index.")

# return reads from start to end
def reads(request):
	try:
		specimen = str(request.GET.get('specimen', ''))
		start = int(request.GET.get('start', ''))
		end = int(request.GET.get('end', ''))
		name = str(request.GET.get('name', ''))
		chrom = str(request.GET.get('chrom', ''))

		return HttpResponse(analyze_reads_from_start(specimen, start, end, name, chrom))
	except ValueError as e:
		print e
		return HttpResponse("bad params dude")
		
def pileups(request):
	try:
		specimen = str(request.GET.get('specimen', ''))
		start = int(request.GET.get('start', ''))
		end = int(request.GET.get('end', ''))
		name = str(request.GET.get('name', ''))
		chrom = str(request.GET.get('chrom', ''))

		return HttpResponse(analyze_pileups_from_start(specimen, start, end, name, chrom))
	except ValueError as e:
		print e
		return HttpResponse("bad params dude")






import pysam
import pybedtools
import csv
import StringIO

"""filter reads based on where this gene starts and ends"""
def analyze_reads_from_start(specimen, start, end, gene, chrom):
	# load this file
	# try to keep it in memory?
	s = pysam.Samfile('/media/Data/Downloads/real/' + specimen, 'rb')

	# use temporary file instead of saving
	temp = StringIO.StringIO()
	out = csv.writer(temp, delimiter='\t')
	out.writerow(['start', 'end', 'read1'])

	
	# alns = s.fetch(chrom, 0, s.lengths[s.gettid(chrom)])
	alns = s.fetch(chrom, start, end)
	
	for aln in alns:
		# if aln.pos > start and aln.pos < end:
		out.writerow([aln.pos, aln.pos + aln.qlen, aln.is_read1])
		
		print "\033[A                                       \033[A"
		print 'found read @ %d' % aln.pos
		# sys.stdout.flush()

	return temp.getvalue()
	# temp.close()

"""filter reads based on where this gene starts and ends"""
def analyze_pileups_from_start(specimen, start, end, gene, chrom):
	s = pysam.Samfile('/media/Data/Downloads/real/' + specimen, 'rb')

	# use temporary file instead of saving
	temp = StringIO.StringIO()
	out = csv.writer(temp, delimiter='\t')
	out.writerow(['n'])

	piles = s.pileup(chrom, start, end)
	print 'starting'
	
	for pile in piles:
		out.writerow([pile.n])

	return temp.getvalue()
	# temp.close()

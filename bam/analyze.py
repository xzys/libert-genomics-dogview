import pysam
import pybedtools
import csv
import time, sys

class Counter:
	def __init__(self, length):
		self.lis = [0] * length

	def __call__(self, aln):
		# print aln.pos, aln.qlen
		for i in range(aln.pos, aln.pos + aln.qlen):
			self.lis[i] += 1


def analyze_pileups(s):
    # for i in range(len(s.lengths)):
    for i in range(10):
		print 'analyzing pileup %s...' % s.getrname(i)
		pileup = s.pileup(s.getrname(i), 10, int(s.lengths[i]))

		with open('data/pileups/' + s.getrname(i) + '.tsv', 'wb') as out:
			out = csv.writer(out, delimiter='\t')
			out.writerow(['n'])
			for pile in pileup:
				out.writerow([pile.n])
		print 'DONE'
		sys.stdout.flush()

def analyze_reads(s):
	for i in range(len(s.lengths)):
		alns = s.fetch(s.getrname(i), 0, s.lengths[i])

		with open('data/' + s.getrname(i) + 'reads.tsv', 'wb') as out:
			out = csv.writer(out, delimiter='\t')
			out.writerow(['start', 'end', 'read1'])

			for aln in alns:
				out.writerow([aln.pos, aln.pos + aln.qlen, aln.is_read1])
				# print aln.pos, aln.pos + aln.qlen, aln.is_read1

		print 'analyzed reads', s.getrname(i)


def analyze_genemodel(gff):
	# apparently to remove invalid enteries
	# print 'cleaning....',
	# gff = pybedtools.BedTool(pregff).remove_invalid().saveas()
	# print 'cleaned'

	l = len(gff)
	print '%d total records found' % l

	
	with open('data/gene_model_index', 'wb') as index:
		index = csv.writer(index, delimiter='\t')
		index.writerow(('gene_id', 'gene_name', 'start', 'end', 'stand', 'chrom'))

		# hold data about last gene

	cur_gene = {'id' : '', 'start' : 0, 'end' : 0, 'name' : '', 'stand' : '', 'chrom' : '', 'num' : 0}
	
	print gff.each(split_gff, cur_gene=cur_gene, total=l)

def split_gff(feature, cur_gene, total):
	# for every gene make a new file
	if cur_gene['id'] != feature.attrs['gene_id']:
		# do this EXCEPT for very first time
		if cur_gene['id'] != '':
			# save index of information
			with open('data/gene_model_index', 'a') as index:
				index = csv.writer(index, delimiter='\t')
				index.writerow((cur_gene['id'],
								cur_gene['name'],
								cur_gene['start'], # start and end of entire gene, not just feature
								cur_gene['end'], 
								cur_gene['strand'], 
								cur_gene['chrom']))

		# move on to new gene
		print "\033[A                                       \033[A"
		print 'starting gene %s on chromosome %s strand %s' % \
			   (feature.attrs['gene_id'].ljust(15), feature.chrom, feature.strand) 
			   	# round(float(cur_gene['num'])/float(total) * 100, 2))

		cur_gene['id'] = feature.attrs['gene_id']
		cur_gene['name'] = feature.attrs['gene_name']
		cur_gene['start'] = feature.start
		cur_gene['start'] = feature.end
		cur_gene['strand'] = feature.strand
		cur_gene['chrom'] = feature.chrom

		# write first line
		with open('data/models/' + cur_gene['id'] + '.model', 'wb') as out:
			writer = csv.writer(out, delimiter='\t')
			writer.writerow(['start', 'end', 'type'])

	cur_gene['start'] = min(cur_gene['start'], feature.start)
	cur_gene['end'] = max(cur_gene['end'], feature.end)

	with open('data/models/' + cur_gene['id'] + '.model', "a") as out:
		writer = csv.writer(out, delimiter='\t')
		writer.writerow((feature.start, feature.end, feature[2]))

	cur_gene['num'] += 1

def main():
	print 'loading...',
	s = pysam.Samfile('/media/Data/Downloads/real/accepted_hits_2_old.bam', 'rb')
	print 'loaded'
	sys.stdout.flush()
	analyze_pileups(s)
	# analyze_reads(s)
	

	# print 'loading.....',
	# gff = pybedtools.BedTool('../latest_dog_genes.gff')
	# print 'loaded'
	# analyze_genemodel(gff)


if __name__ == '__main__':
	main()
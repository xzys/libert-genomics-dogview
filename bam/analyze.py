import pysam
import pybedtools
import csv

class Counter:
	def __init__(self, length):
		self.lis = [0] * length

	def __call__(self, aln):
		# print aln.pos, aln.qlen
		for i in range(aln.pos, aln.pos + aln.qlen):
			self.lis[i] += 1


def analyze_pileups(s):
    for i in range(len(s.lengths)):
		pileup = s.pileup(s.getrname(i), 10, int(s.lengths[i]))

		with open('data/' + s.getrname(i) + '.tsv', 'wb') as out:
			out = csv.writer(out, delimiter='\t')
			out.writerow(['n'])
			for pile in pileup:
				out.writerow([pile.n])

		print 'analyzed pileup', s.getrname(i)

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
	# g = pybedtools.BedTool(gff).remove_invalid().saveas()
	# print 'cleaned'

	l = len(gff)
	print '%d total records found' % l

	i = 0
	cur_gene = ''
	cur_gene_start = 0
	cur_gene_end = 0
	out = None
	writer = None
	with open('data/gene_model_index', 'wb') as index:
		index = csv.writer(index, delimiter='\t')
		index.writerow(['gene_id', 'gene_name', 'start', 'end', 'stand', 'chrom'])

		while i < l:
			# for every gene make a new file
			if cur_gene != gff[i].attrs['gene_id']:
				# do this EXCEPT for very first time
				if out != None: 
					out.close()
					# save index of information
					index.writerow([cur_gene,
									gff[i-1].attrs['gene_name'],
									cur_gene_start, # start and end of entire gene, not just feature
									cur_gene_end, 
									gff[i-1].strand, 
									gff[i-1].chrom])

				# move on to new gene
				print 'starting gene %s' % gff[i].attrs['gene_id']
				cur_gene = gff[i].attrs['gene_id']
				cur_gene_start = gff[i].start

				out =  open('data/models/' + cur_gene + '.model', 'wb')

				writer = csv.writer(out, delimiter='\t')
				writer.writerow(['start', 'end', 'type'])

			cur_gene_start = min(cur_gene_start, gff[i].start)
			cur_gene_end = max(cur_gene_end, gff[i].end)
			writer.writerow([gff[i].start, gff[i].end, gff[i][2]])
			i += 1

	# make sure you close
	out.close()



def main():
	# s = pysam.Samfile('ex1.sorted.bam', 'rb')
	

	# analyze_pileups(s)
	# analyze_reads(s)
	print 'loading.....',
	gff = pybedtools.BedTool('../latest_dog_genes.gff')
	print 'loaded'
	analyze_genemodel(gff)


if __name__ == '__main__':
	main()
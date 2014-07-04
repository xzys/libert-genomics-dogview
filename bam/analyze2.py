import pysam
import pybedtools
import csv
import time

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
	# gff = pybedtools.BedTool(pregff).remove_invalid().saveas()
	# print 'cleaned'

	l = len(gff)
	print '%d total records found' % l

	with open('data/gene_model_index', 'wb') as index:
		index = csv.writer(index, delimiter='\t')
		index.writerow(['gene_id', 'gene_name', 'start', 'end', 'stand', 'chrom'])

		# hold data about last gene

		# cur_gene = {'id' : '', 'start' : 0, 'end' : 0, 'name' : '', 'stand' : '', 'chrom' : ''}
		# out = None
		# writer = None
		
		print 'analyzing'
		a = gff.each(ex)
		# a = gff.each(ex, index=index, out=out, writer=writer, cur_gene=cur_gene)
		
	# cur_gene = {'id' : '', 'start' : 0, 'end' : 0, 'name' : '', 'stand' : '', 'chrom' : ''}
	# out = None
	# writer = None

def ex(feature, cur_gene):
	# print feature.attrs['gene_id']
	cur_gene['start'] += 1
	print cur_gene['start']
	return feature



def split_gff(feature, index, out, writer, cur_gene):
	print cur_gene
	# for every gene make a new file
	if cur_gene['id'] != feature.attrs['gene_id']:
		# do this EXCEPT for very first time
		if cur_gene['id'] == '': 
			out.close()
			# save index of information
			index.writerow([cur_gene['id'],
							cur_gene['name'],
							cur_gene['start'], # start and end of entire gene, not just feature
							cur_gene['end'], 
							cur_gene['strand'], 
							cur_gene['chrom']])

		# move on to new gene
		print 'starting gene %s' % feature.attrs['gene_id']
		cur_gene['id'] = feature.attrs['gene_id']
		cur_gene['name'] = feature.attrs['gene_name']
		cur_gene['start'] = feature.start
		cur_gene['start'] = feature.end
		cur_gene['strand'] = feature.strand
		cur_gene['chrom'] = feature.chrom

		out = open('data/models/' + cur_gene + '.model', 'wb')

		writer = csv.writer(out, delimiter='\t')
		writer.writerow(['start', 'end', 'type'])

	cur_gene['start'] = min(cur_gene['start'], feature.start)
	cur_gene['end'] = max(cur_gene['end'], feature.end)
	writer.writerow([feature.start, feature.end, feature[2]])

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
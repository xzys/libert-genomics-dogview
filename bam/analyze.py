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

def main():
	s = pysam.Samfile('ex1.sorted.bam', 'rb')
	

	# analyze_pileups(s)
	analyze_reads(s)


if __name__ == '__main__':
	main()
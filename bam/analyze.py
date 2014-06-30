import pysam
import csv

class Counter:
	def __init__(self, length):
		self.lis = [0] * length

	def __call__(self, aln):
		# print aln.pos, aln.qlen
		for i in range(aln.pos, aln.pos + aln.qlen):
			self.lis[i] += 1


def my_pileup_callback(pileups):
    print pileups.n,

def main():
	s = pysam.Samfile('ex1.sorted.bam', 'rb')
	

	# l = 2000
	# c = Counter(l)
	# s.fetch('seq1', 0, l, callback=c)
	# s.pileup(s.getrname(i), 10, int(s.lengths[i]), callback = my_pileup_callback)
	
	for i in range(len(s.lengths)):
		pileup = s.pileup(s.getrname(i), 10, int(s.lengths[i]))

		with open('data/' + s.getrname(i) + '.tsv', 'wb') as out:
			out = csv.writer(out, delimiter='\t')
			out.writerow(['n'])
			for pile in pileup:
				out.writerow([pile.n])

		print 'analyzed', s.getrname(i)


if __name__ == '__main__':
	main()


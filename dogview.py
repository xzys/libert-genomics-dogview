from flask import Flask
from flask import request
from flask import abort
from flask import render_template
import numpy
import random
import pysam
import pybedtools
import csv
import StringIO
import itertools
from scipy.odr import Model, Data, RealData, ODR
app = Flask(__name__)


mikedir = '/home/server/Desktop/mike_workdir'

# VIEWS
@app.route('/index')
def index():
    return render_template('graph.html')

@app.route('/getkey')
def getkey():
    with open('data/key') as f:
        lines = f.readlines()
        return ''.join(lines)

@app.route('/trendline')
def trendline():
    try:
        gene = request.args['gene']
    except:
        return abort(404)

    temp = StringIO.StringIO()
    out = csv.writer(temp, delimiter='\t')
    

    with open('data/trendlines') as f:
        read = csv.reader(f, delimiter='\t')
        out.writerow(['gene', 'a', 'b', 'r2'])

        found = False
        for line in read:
            if line[0] == gene:
                out.writerow(line)
                found = True

        if found:
            return temp.getvalue()
        else:
            return abort(401)


@app.route('/expressions')
def expressions():
    """
    return a list of all the genes from sample 
    index and their expression values"""
    
    try:
        gene = request.args['gene']
    except:
        return abort('bad params dude')

    expressions = []
    actins = []
    ages = []

    with open('data/key') as f:
        lines = f.readlines()
        samples = 8
        for l in lines[1:]:
            ages.append(float(l.split('\t')[2]))

        with open(mikedir + '/All8_t_only/genes.fpkm_tracking') as f:
            # find the expression of this gene
            fpkms = next((row.split('\t')[9:] for row in f if row.split('\t')[4] == gene), None)
            if fpkms:
                for i in range(samples):
                    expressions.append(float(fpkms[i * 4]))
            else:
                abort('Gene not found')
            
            # find the expression of this ACTB
            # currently not using
            fpkms = next((row.split('\t')[9:] for row in f if row.split('\t')[4] == 'ACTB'), None)
            for i in range(samples):
                actins.append(float(fpkms[i * 4]))

    x = ages
    y = expressions

    a, b, r2 = calculate_ortho_regression(x, y, samples)
    # save this trendline for later use

    found = False
    with open('data/trendlines') as f:
        lines = f.readlines()
        lines = lines[1:]

        for l in lines:
            if l.split('\t')[0] == gene:
                found = True
                break

    if not found:
        with open('data/trendlines', 'a') as f:
            line = '\t'.join((str(j) for j in (gene, a, b, r2)))
            print line
            f.write('\n' + line)


    temp = StringIO.StringIO()
    with open('data/key') as f:
        lines = f.readlines()

        out = csv.writer(temp, delimiter='\t')
        out.writerow(['id', 'age', 'breed', 'gene', 'expression', 'actin', 'normalized'])
        for i in range(samples):
            pr = lines[i + 1].split('\t')
            out.writerow((
                pr[0], 
                ages[i], 
                pr[3].strip(), 
                gene, 
                expressions[i], 
                actins[i], 
                expressions[i]/actins[i]))
    return temp.getvalue()

@app.route('/reads')
def reads(request):
    """return reads from start to end"""
    try:
        sample = str(request.args['sample'])
        start = int(request.args['start'])
        end = int(request.args['end'])
        name = str(request.args['name'])
        chrom = str(request.args['chrom'])

        # bad request
        if end - start > 100000:
            raise ValueError()

        return analyze_reads_from_start(sample, start, end, name, chrom)
    except ValueError as e:
        print e
        return abort("bad params dude")

@app.route('/pileups')
def pileups(request):
    """
    same thing really but only get the pileups
    and not reads
    """
    try:
        sample = str(request.args['sample'])
        start = int(request.args['start'])
        end = int(request.args['end'])
        name = str(request.args['name'])
        chrom = str(request.args['chrom'])

        if end - start > 100000:
            raise ValueError()

        return analyze_pileups_from_start(sample, start, end, name, chrom)
    except ValueError as e:
        print e
        return abort("bad params dude")


def refresh_gene_index():
    pass









def calculate_regression(x, y, samples):
    y_mean = sum(y) / samples
    a = ((samples * sum((x[i] * y[i] for i in range(samples))) 
         - (sum(x) * sum(y))) / 
         (samples * sum((x[i] * x[i] for i in range(samples))) - pow(sum(x), 2)))
    b = ((sum(y) - (a * sum(x))) /
         samples)
    r2 = (sum((pow(y[i] - (a * x[i] + b), 2) for i in range(samples))) /
          sum((y[i] - y_mean for i in range(samples))))

    return (a, b, r2)


def func(B, x):
    ''' B is a vector of the parameters.
    x is an array of the current x values.
    x is in the same format as the x passed to Data or RealData.
    Return an array in the same format as y passed to Data or RealData.
    '''
    return B[0]*x + B[1]


def calculate_ortho_regression(x, y, samples):
    sx = numpy.cov(x, y)[0][0]
    sy = numpy.cov(x, y)[1][1]

    
    linear = Model(func)
    # data = Data(x, y, wd=1./pow(sx, 2), we=1./pow(sy, 2))
    data = Data(x, y)
    odr = ODR(data, linear, beta0=[1., 2.])
    out = odr.run()

    print '\n'
    out.pprint()
    print '\n'

    return (out.beta[0], out.beta[1], out.res_var)



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








if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

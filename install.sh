#!/usr/bin/bash
#
# install script to install fastqc, samtools, 

use warnings;
use strict;


echo "Hello stranger. Ready to install here?"

mkdir install
cd install
sudo apt-get install zlib1g-dev zlib1g build-essential make cmake g++ -y

sudo apt-get install tophat fastqc cufflinks samtools -y

git clone git://github.com/pezmaster31/bamtools.git
cd bamtools
mkdir build
cd build
cmake --version
cmake ..
make







# DOWNLOADS
# samtools
wget -O samtools-0.1.19.tar.bz2 http://sourceforge.net/projects/samtools/files/latest/download?source=files
tar xvf samtools-0.1.19.tar.bz2
# fastqc
wget -O fastqc_v0.11.2.zip http://www.bioinformatics.babraham.ac.uk/projects/fastqc/fastqc_v0.11.2.zip
unzip fastqc_v0.11.2.zip
sudo ln -s FastQC/fastqc /usr/local/bin/fastqc
# sratoolkit
wget -O sratoolkit.2.3.5-2-ubuntu64.tar.gz http://ftp-trace.ncbi.nlm.nih.gov/sra/sdk/2.3.5-2/sratoolkit.2.3.5-2-ubuntu64.tar.gz
tar xvf sratoolkit.2.3.5-2-ubuntu64.tar.gz
# tophat
sudo apt-get install tophat -y
# cuff links
wget -O cufflinks-2.2.1 http://cufflinks.cbcb.umd.edu/downloads/cufflinks-2.2.1.Linux_x86_64.tar.gz
tar xvf ../cufflinks-2.2.1.Linux_x86_64.tar.gz

# bamtools
git clone git://github.com/pezmaster31/bamtools.git
sudo apt-get install cmake g++ zlib1g-dev zlib1g lib61z1 -y

cd bamtools
mkdir build
cd build
cmake --version
cmake ..
make







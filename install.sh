#!/usr/bin/bash
#!/bin/bash
# install script to install fastqc, samtools, 

use warnings;
use strict;

echo "Hello stranger. Ready to install here?"
read -p "Press [Enter] key to start install..."

mkdir install
cd install

echo "installing build tools"
sudo apt-get install zlib1g-dev zlib1g build-essential make cmake g++ lib61z1 default-jre default-jdk -y

echo "installing genomic software: Tophat, Fastqc, cufflinks, samtools"
sudo apt-get install tophat fastqc cufflinks samtools -y


sudo apt-get install python-dev libxml2-dev libxslt-dev python-pip

echo "installing bamtools"
git clone git://github.com/pezmaster31/bamtools.git
cd bamtools
mkdir build
cd build
cmake --version
cmake ..
make





if flase; then
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
	# cuff links
	wget -O cufflinks-2.2.1 http://cufflinks.cbcb.umd.edu/downloads/cufflinks-2.2.1.Linux_x86_64.tar.gz
	tar xvf ../cufflinks-2.2.1.Linux_x86_64.tar.gz








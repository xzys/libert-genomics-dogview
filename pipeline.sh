#!/bin/bash
# install script to install fastqc, samtools, 

# startup

echo "Hello stranger. Ready to start the pipeline?"
read -p "Press [Enter]"

echo "These are files you want to analyze?"
for file in *.fastq
do
	echo $file
done
read -p "Press [Enter]"

echo "How many processors would you like to use in alignment: "
read nump

echo "Location of Bowtie Genome to align with: "
read genomeloc


# make directories that you need
if [! -d fastqc_out ]; then
	mkdir fastqc_out
fi
if [! -d trimmed ]; then
	mkdir trimmed
fi
if [! -d tophat_alignment ]; then
	mkdir tophat_alignment
fi
if [! -d cuffquant_out ]; then
	mkdir cuffquant_out
fi





# do everything inside a tmux session
tmux new-session -d -s session -n home
tmux attach -t session

# run commands inside it like this WHEN ATTACHED
# tmux select-pane -t 0
# tmux send-keys -t home 'sleep 5;t lsgc' Enter



read -p "Press [Enter] to start Quality Control with fastqc..."

# for file in *.fastq
# do
# 	fastqc --noextract -o fastqc_out $file
# done





# printf "\n\n\n"
# echo "Chcek the fastqc_report.html file to see if everything passed."
# read -p "Press [Enter] to start trimming..."



# for file in fastqc_out/*.fastq
# do
# 	bn = b=$(basename $file)
# 	cutadapt -m 20 -q 20 -a AGATCGGAAGAGCAC --match-read-wildcards -o trimmed/trimmed_$bn $file cutadapt_output.out
# done






# printf "\n\n\n"
# echo "Running FastQC again just to be sure."
# for file in trimmed/*
# do
# 	fastqc -q --noextract -o fastqc_out $file
# done


# printf "\n\n\n"
# echo "Chceking to see if GFF file exists."
# if [!-f gff_out/latest_genes.gff ]; then
# 	echo "Please give directory of latest_genes.gtf: "
# 	read gtfloc
	
# 	mkdir gff_files
	
# 	# genome files in .bt2 format must in the directory that you are currently in
# 	tophat -G $gtfloc --transcriptome-index=gff_files genome
# fi





# printf "\n\n\n"
# echo "Found gff_output_dir/latest_genes."
# read -p "Press [Enter] to start alignment."



# for file in trimmed/*
# do
# 	tophat -p $nump -o tophat_alignment \
# 			--transcriptome-index=gff_files/latest_genes \
# 			--no-novel-juncs $genomeloc $file
# done





# echo "Alignment Complete."
# read -p "Press [Enter] to quantify gene expression with cuffquant."

# for file in tophat_alignment/*
# do
# 	cuffquant -p $nump -o cuffquant_out gff_out/latest_genes.gff $file
# done


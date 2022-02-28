#!/bin/bash

#SBATCH --job-name=covid_data
#SBATCH --output=covid_data.out
#
#SBATCH --ntasks=1
#SBATCH --time=8:00:00
#SBATCH --mem-per-cpu=8g

# The directory of the cloned github repo.
PROJECT_DIR=~/projects/va-project

#--max_features=100000 $SLURM_ARRAY_TASK_ID
# --docid=$SLURM_ARRAY_TASK_ID --split=mesh_valid_2021
#############################################################
python $PROJECT_DIR/snscraper.py
# python $PROJECT_DIR/scripts/bert_one_eval_cal.py --split=mesh_test_2021 --model_name=single_focal_sample_new_1e5_1e6_25
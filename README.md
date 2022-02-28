# INLS 641 Semester project
Project repository for Twitter analytics, specifically concerned with determining user groups and trends concerning COVID-19.

## Set up on Longleaf
1. Login to Longleaf
    ```
    ssh -X <onyen>@longleaf.unc.edu
    ```
2. Clone this github repo to login node
    ```
    git clone https://github.com/Geubam/va-project.git
    ```
3. Setup environment on Longleaf
    ```
    module load anaconda/5.2.0
    module save
    conda create -n myenv python=3.8
    ```
    After creating the environment, don't forget to activate the environment.
    ```
    source activate myenv
    ```
4. Install Pandas and snscraper
    ```
    pip install pandas
    pip install git+https://github.com/JustAnotherArchivist/snscrape.git
    ```
5. Enter into the project folder, open `snscraper.py` and change the variable `store_location` to the folder where you want to store the data
6. Submit job
    ```
    sbatch scripts/job.sh
    ```
    You can check your job status by 
    ```
    squeue -u <onyen>
    ```

## Userful Links
- [Documentation](https://github.com/JustAnotherArchivist/snscrape/blob/master/snscrape/modules/twitter.py)
- [Example](https://betterprogramming.pub/how-to-scrape-tweets-with-snscrape-90124ed006af)
- [Conda](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html)
- [Longleaf geting started](https://its.unc.edu/research-computing/techdocs/getting-started-on-longleaf/)
- [Longleaf Module](https://its.unc.edu/research-computing/techdocs/modules-approach-to-software-management/)
- [Longleaf job submission](https://its.unc.edu/research-computing/techdocs/longleaf-slurm-examples/)
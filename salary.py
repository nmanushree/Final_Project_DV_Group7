import pandas as pd

# Load the dataset
data_path = 'jobs_in_data.csv'
data = pd.read_csv(data_path)

# Display the structure of the dataset
print(data.head())
print(data.columns)

# Aggregate data by 'company_size'
sal_company_size_data = data.groupby('company_size')['salary'].mean().reset_index()
sal_company_size_data.columns = ['label', 'average_salary']
sal_company_size_data['category'] = 'CompanySize'
sal_company_size_data.to_csv('salary comp/sal_company_size_data.csv', index=False)

# Assume 'work_setting' is a column; replace it with the correct column name if different
sal_work_setting_data = data.groupby('work_setting')['salary'].mean().reset_index()
sal_work_setting_data.columns = ['label', 'average_salary']
sal_work_setting_data['category'] = 'WorkSetting'
sal_work_setting_data.to_csv('salary comp/sal_work_setting_data.csv', index=False)

# Aggregate data by 'job_title'
sal_job_title_data = data.groupby('job_title')['salary'].mean().reset_index()
sal_job_title_data.columns = ['label', 'average_salary']
sal_job_title_data['category'] = 'JobTitle'
sal_job_title_data.to_csv('salary comp/sal_job_title_data.csv', index=False)

# Aggregate data by 'experience_level'
sal_experience_level_data = data.groupby('experience_level')['salary'].mean().reset_index()
sal_experience_level_data.columns = ['label', 'average_salary']
sal_experience_level_data['category'] = 'ExperienceLevel'
sal_experience_level_data.to_csv('salary comp/sal_experience_level_data.csv', index=False)

from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

from airflow.tasks.cleanup import reset_daily_likes

with DAG(
    dag_id="reset_daily_limits",
    start_date=datetime(2026, 1, 1),
    schedule_interval="0 0 * * *",
    catchup=False
) as dag:

    reset = PythonOperator(
        task_id="reset_likes",
        python_callable=reset_daily_likes
    )

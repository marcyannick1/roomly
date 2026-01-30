from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

from airflow.tasks.cleanup import detect_inactive_profiles, notify_inactive_users, deactivate_profiles

with DAG(
    dag_id="inactive_profiles_cleanup",
    start_date=datetime(2026, 1, 1),
    schedule_interval="@monthly",
    catchup=False
) as dag:

    detect = PythonOperator(
        task_id="detect_inactive_profiles",
        python_callable=detect_inactive_profiles
    )

    notify = PythonOperator(
        task_id="notify_users",
        python_callable=notify_inactive_users
    )

    deactivate = PythonOperator(
        task_id="deactivate_profiles",
        python_callable=deactivate_profiles
    )

    detect >> notify >> deactivate

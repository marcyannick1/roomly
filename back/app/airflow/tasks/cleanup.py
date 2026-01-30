from datetime import datetime, timedelta
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from back.app.db.session import engine
from back.app.models.user import User
from back.app.models.student import Student
from back.app.models.landlord import Landlord
import logging

logger = logging.getLogger(__name__)

INACTIVITY_THRESHOLD_DAYS = 90
WARNING_THRESHOLD_DAYS = 60


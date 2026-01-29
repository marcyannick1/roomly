from pydantic import BaseModel

class StudentBase(BaseModel):
    room_type: str
    furnished: bool = False
    smoking: bool = False
    pets: bool = False
    noise_level: int
    max_budget: float
    guarantor_income: float
    university: str
    study_level: str
    passions: str

class StudentCreate(StudentBase):
    user_id: int

class StudentOut(StudentBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

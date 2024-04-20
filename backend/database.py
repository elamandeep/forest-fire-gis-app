from sqlalchemy import MetaData, create_engine 
from sqlalchemy.orm import declarative_base 
from dotenv import load_dotenv
import os

load_dotenv()


engine = create_engine(url=os.environ["DATABASE_URL"])

metadata = MetaData()
base = declarative_base(metadata=metadata)


metadata.create_all(engine)

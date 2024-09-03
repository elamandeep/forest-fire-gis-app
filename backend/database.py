from geoalchemy2 import Geometry
from sqlalchemy import Column, Integer, MetaData, String, create_engine
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import os

load_dotenv()


engine = create_engine(url=os.environ["DATABASE_URL"])

metadata = MetaData()
Base = declarative_base(metadata=metadata)


class ForestFire(Base):
    __tablename__ = "forest_fire"
    __table_args__ = {"schema": "public"}
    id = Column(Integer, primary_key=True, autoincrement=True)
    forest_id = Column(Integer)
    geom = Column(Geometry("POINT"))


class FireStation(Base):
    __tablename__ = "fire_station"
    __table_args__ = {"schema": "public"}
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    geom = Column(Geometry("POINT"))


class M_Hospitals(Base):
    __tablename__ = "m_hospitals"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    geom = Column(Geometry("POINT"))

metadata.create_all(engine)

from sqlalchemy import text
from database import *
from sqlalchemy.orm import sessionmaker
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

Session = sessionmaker(bind=engine)
session = Session()


def to_wkt(geom):
    return geom.wkt


forest_fire_data = [
    {
        "forest_id": 1,
        "geom": to_wkt(Point(77.610727, 12.967091)),  # Coordinates of Delhi
    },
    {
        "forest_id": 2,
        "geom": to_wkt(Point(78.486671, 17.375278)),  # Coordinates of Hyderabad
    },
    {
        "forest_id": 3,
        "geom": to_wkt(Point(88.363891, 22.572645)),  # Coordinates of Kolkata
    },
]

for data in forest_fire_data:
    sql = """
            INSERT INTO forest_fire (forest_id, geom)
            VALUES (:forest_id, ST_GeomFromText(:geom, 4326))
        """
session.execute(text(sql), data)

fire_station_data = [
    {
        "name": "Delhi Fire Station",
        "geom": to_wkt(Point(77.610727, 12.967091)),  # Coordinates of Delhi
    },
    {
        "name": "Hyderabad Fire Station",
        "geom": to_wkt(Point(78.486671, 17.375278)),  # Coordinates of Hyderabad
    },
    {
        "name": "Kolkata Fire Station",
        "geom": to_wkt(Point(88.363891, 22.572645)),  # Coordinates of Kolkata
    },
]

for data in fire_station_data:
    sql = """
            INSERT INTO fire_station (name, geom)
            VALUES (:name, ST_GeomFromText(:geom, 4326))
        """
session.execute(text(sql), data)

m_hospitals_data = [
    {
        "name": "AIIMS Delhi",
        "geom": to_wkt(Point(77.610727, 12.967091)),  # Coordinates of Delhi
    },
    {
        "name": "Apollo Hospital Hyderabad",
        "geom": to_wkt(Point(78.486671, 17.375278)),  # Coordinates of Hyderabad
    },
    {
        "name": "S.S.K.M. Hospital Kolkata",
        "geom": to_wkt(Point(88.363891, 22.572645)),  # Coordinates of Kolkata
    },
]

for data in m_hospitals_data:
    sql = """
            INSERT INTO m_hospitals (name, geom)
            VALUES (:name, ST_GeomFromText(:geom, 4326))
        """

session.execute(text(sql), data)
session.commit()

print("data is inserted successfully....")

from typing import Union
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from database import engine
import uvicorn
from sqlalchemy.sql import text 
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import json
app = FastAPI()

origins =[
    "http://localhost:5173",
    "http://localhost:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/forest_fire/")
def get_forest_fire():
    with engine.connect() as conn:
        rows = conn.execute(text("""
        SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(ST_AsGeoJSON(t.*)::json)) FROM ( select * from forest_fire) as t(id, name);
    """))
        for r in rows:
            file = open("data.json", 'w')
            json.dump(r[0], file)

            print(r[0], type(r[0]))
            return JSONResponse(content= json.dumps(r[0]))

        return JSONResponse(content={})


@app.get("/firestation-near-forestfire/")
def get_station_near_forestfire(forest_id:int ,radius:Optional[int] = 100000):
    with engine.connect() as conn:
     rows = conn.execute(text("""
        select json_build_object(
            'type','FeatureCollection',
            'features', json_agg(
                CASE WHEN t.geom IS NULL THEN
      json_build_object(
        'type', 'Feature',
        'geometry', NULL,
        'properties', t.*
      )
    ELSE
      ST_AsGeoJSON(t.*)::json
    END
            )
        ) FROM (
        select s.* from 
	  public.forest_fire f left join public.fire_station s on st_dwithin(f.geom::geography , s.geom::geography, :radius)
	  where f.forest_id = :forest_id) as t
"""), {"forest_id": forest_id, "radius":radius})

    for r in rows:
        return JSONResponse(content= json.dumps(r[0]))
    return JSONResponse(content={})


@app.get("/hosptial-near-forestfire/")
def get_station_near_forestfire(forest_id:int ,radius:Optional[int] = 100000):
    with engine.connect() as conn:
     rows = conn.execute(text("""
        SELECT json_build_object(
  'type', 'FeatureCollection',
  'features', json_agg(
    CASE WHEN t.geom IS NULL THEN
      json_build_object(
        'type', 'Feature',
        'geometry', NULL,
        'properties', t.*
      )
    ELSE
      ST_AsGeoJSON(t.*)::json
    END
  )
)
FROM (
 
select h.*  from 
	  forest_fire f left join public.m_hosptials h on st_dwithin(f.geom::geography , h.geom::geography, 10000)
	  where f.forest_id = 1 
) AS t;

"""), {"forest_id": forest_id, "radius":radius})

    for r in rows:
        return JSONResponse(content= json.dumps(r[0]))
    return JSONResponse(content={})


@app.get("/nearest_station/")
def get_nearest_station(forest_id:int ,radius:Optional[int] = 100000):

    with engine.connect() as conn:
        rows = conn.execute(text("""
     SELECT json_build_object(
  'type', 'FeatureCollection',
  'features', json_agg(
    CASE WHEN t.geom IS NULL THEN
      json_build_object(
        'type', 'Feature',
        'geometry', NULL,
        'properties', t.*
      )
    ELSE
      ST_AsGeoJSON(t.*)::json
    END
  )
)
FROM (
 
select s.*,ST_distance(st_transform(f.geom,26986), st_transform(s.geom,26986)) as distance 	from public.forest_fire f left join 
public.fire_station s on st_dwithin(f.geom::geography , s.geom:: geography, :radius) where f.forest_id = :forest_id
order by distance asc
) AS t;
    """),{"forest_id": forest_id, "radius":radius})

    for r in rows:
        return JSONResponse(content= json.dumps(r[0]))
    return JSONResponse(content={})




if __name__ == "__main__":
    uvicorn.run(app="main:app", reload=True)
    

from sqlalchemy import MetaData, create_engine 
from sqlalchemy.orm import declarative_base 

engine = create_engine(url='postgresql://postgres:pOsTgRess@localhost:5432/emberwatch')

metadata = MetaData()
base = declarative_base(metadata=metadata)


metadata.create_all(engine)

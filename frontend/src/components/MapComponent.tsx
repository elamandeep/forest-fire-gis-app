
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { useEffect } from 'react';
import { useAppStore } from '../utils/store';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { useQuery } from '@tanstack/react-query';

const MapComponent = () => {
    const { setMapObj, setForestList , setView} = useAppStore(state => ({
        setMapObj: state.setMapObj,
        setForestList: state.setForestList,
        setView:state.setView
    }))

    
    const {data} = useQuery({
        queryKey:['forestfire'],
        queryFn:async()=>{
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/forest_fire/`)
                const data = await res.json()
                return data
            } catch (error) {
                return error
            }
        }
    })


    useEffect(() => {

        if (data === undefined) return

        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(data),
        });

        let parsedValue = JSON.parse(data)
        setForestList(parsedValue.features)

        let view = new View({
            center: [84.94611007669397,
                21.50596611886573],
            zoom: 8,
            projection: "EPSG:4326"
        })

        const map = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: vectorSource,
                    style: new Style({
                        image: new Icon({
                            src: '/fire.png',
                        }),
                    }),
                }),

            ],
            view,
        });

        setMapObj(map)
        setView(view)

    }, [data])


    return (
        <>
            <div id="map"></div>
        </>
    )
}

export default MapComponent
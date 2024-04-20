
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../utils/store';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { useQuery } from '@tanstack/react-query';
import { Overlay } from 'ol';

const MapComponent = () => {
    const { setMapObj, setForestList, setView } = useAppStore(state => ({
        setMapObj: state.setMapObj,
        setForestList: state.setForestList,
        setView: state.setView
    }))

    const popoverRef = useRef<HTMLElement | null>(null)
    const popoverCloseRef = useRef<HTMLElement | null>(null)
    const popoverContentRef = useRef<HTMLElement | null>(null)

    function getValuesByKeys(object: Record<string, any>, keys: Array<string>) {
        const allValues = Object.values(object);
        let filteredValue = ''

        for (const value of allValues) {
            if (keys.includes(Object.keys(object)[allValues.indexOf(value)])) {
                filteredValue += value
            }
        }

        return filteredValue;
    }

    const { data } = useQuery({
        queryKey: ['forestfire'],
        queryFn: async () => {
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
        if (popoverRef === null) return

        const overlays = new Overlay({
            //@ts-ignore
            element: popoverRef!.current,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },

        })


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
            overlays: [overlays],
            view,
        });


        map.on("singleclick", (e) => {
            map.forEachFeatureAtPixel(e.pixel, (feature) => {


                const { geometry, ...rest } = feature.getProperties()
                popoverContentRef.current!.innerHTML = `
                <div>${getValuesByKeys(rest, ['forest', 'name', 'station'])}</div>
                `

                // @ts-ignore
                overlays.setPosition(feature.getGeometry().getCoordinates())
            })
        })

        popoverCloseRef.current!.onclick = function () {
            overlays.setPosition(undefined);
            popoverCloseRef.current!.blur();
            return false;
        };


        setMapObj(map)
        setView(view)


    }, [data])



    return (
        <>
            <div id="map"></div>

            <div className='ol-popup' ref={(elem) => popoverRef.current = elem}>
                <button className='ol-popup-closer' ref={(elem) => popoverCloseRef.current = elem}>
                </button>

                <div ref={(elem) => popoverContentRef.current = elem}>

                </div>
            </div>

        </>
    )
}

export default MapComponent
import { useCallback, useEffect, useMemo, useState } from "react"
import { queryList, radius } from "../utils/options"
import { useAppStore } from "../utils/store"

import VectorSource from "ol/source/Vector"
import GeoJSON from "ol/format/GeoJSON"
import VectorLayer from "ol/layer/Vector"
import Icon from "ol/style/Icon"
import Style from "ol/style/Style"
import { Feature } from "ol"
import { Geometry } from "ol/geom"
import { Map } from 'ol'
import { useMutation } from "@tanstack/react-query"

import toast from "react-hot-toast"
import { Alert } from "./ui/Alert"


const ToolBox = () => {
    const { forestList, mapObj, view } = useAppStore(state => ({ forestList: state.forestList, mapObj: state.mapObj, view: state.view }))
    const [formData, setFormData] = useState({
        query: "",
        radius: "",
        forest: "",
    })
    const [url, setUrl] = useState("")


  

    const currentForest = useMemo(() => forestList.find((forest => (
        forest.properties.id === parseInt(formData.forest)
    ))), [formData.forest, forestList])



    const featuresCount = useCallback((vectorSource: VectorSource<Feature<Geometry>>): number => {


        let featuresArray = vectorSource.getFeatures();

 
        if (featuresArray.length === 0) {
            return 0;
        }


        let nonNullGeometryFound = false;
        let vectorArrayLength = featuresArray.length;

        for (let i = 0; i < vectorArrayLength; i++) {
            let elemGeom = featuresArray[i].getGeometry();
            if (elemGeom !== null) {
                nonNullGeometryFound = true;
                break;
            }
        }

        return nonNullGeometryFound ? vectorArrayLength : 0;



    }, [])




    const mutation = useMutation({
        mutationFn: async (url: string) => {

            try {
                const res = await fetch(import.meta.env.VITE_API_URL + "" + url)
                const data = await res.json()

                return data
            } catch (error) {
                return error
            }
        }
    })


    const addCurrentLayer = (layer: VectorLayer<VectorSource<Feature<Geometry>>>, mapObj: Map | null) => {
            
        let layersArray = mapObj?.getLayers().getArray()
        if (layersArray!.length <= 2) {
            mapObj?.addLayer(layer)
        }


        layersArray!.forEach((elem) => {

            let currentLayer = elem.get("name")
            if (typeof currentLayer !== 'undefined') {
                mapObj?.removeLayer(elem)
                setTimeout(() => {
                    mapObj?.addLayer(layer)
                }, 1000)
            }
        })

    }


    const plotDataOnMap = (data: string) => {


        let parsedObj = JSON.parse(data)
       
       
        if (parsedObj.features.length !== 0) {


            const vectorSource = new VectorSource({
                features: new GeoJSON().readFeatures(data),
            });


            let endIndex = url.indexOf("?")
            let slicedUrl = url.slice(0, endIndex)

            if (slicedUrl === "/firestation-near-forestfire/") {
                let layer = new VectorLayer({
                    source: vectorSource,
                    style: new Style({
                        image: new Icon({
                            src: '/fire-station.png',
                        }),
                    }),
                })

                layer.set("name", "fire-station")
                addCurrentLayer(layer, mapObj)
                let totalValue = featuresCount(vectorSource)
                toast.custom(<Alert title={`${totalValue} firestations found within ${formData.radius.slice(0, 3)} KM`} />, {
                    duration: 4000
                })
            }

            else if (slicedUrl === '/hosptial-near-forestfire/') {
                let layer = new VectorLayer({
                    className: "hospital",
                    source: vectorSource,
                    style: new Style({
                        image: new Icon({
                            src: '/hospital.png',
                        }),
                    }),
                })

                layer.set("name", "hospital")
                addCurrentLayer(layer, mapObj)
                let totalValue = featuresCount(vectorSource)
                toast.custom(<Alert title={`${totalValue} hosptials found within ${formData.radius.slice(0, 3)} KM`} />, {
                    duration: 4000
                })

            }
            else {
                let tempObj = parsedObj
                let clonedObject = { type:"FeatureCollection", "features":  tempObj.features.slice(0,1)  }

                const vectorSource = new VectorSource({
                    features: new GeoJSON().readFeatures(JSON.stringify(clonedObject)),
                });
                const {features} = clonedObject
                
                let layer = new VectorLayer({
                    source: vectorSource,
                    style: new Style({
                        image: new Icon({
                            src: '/fire-station.png',
                        }),
                    }),
                })

                layer.set("name", "fire-station")

                addCurrentLayer(layer, mapObj)

                toast.custom(<Alert title={`${features[0].properties.station} is the closest station to Forest ${formData.forest} `} />, {
                    duration: 4000
                })

            }
        }
    }


    useEffect(() => {
        if (typeof mutation.data === "undefined") return;
        plotDataOnMap(mutation.data)
    }, [mutation.data])



    const handleChange = (e: {
        target: {
            [x: string]: any
        }
    }) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        let generatedUrl = formData.query + "?forest_id=" + formData.forest + "&radius=" + formData.radius
        setUrl(generatedUrl)
        mutation.mutate(generatedUrl)
       

      
            view!.animate({
                center: currentForest.geometry.coordinates,
                duration: 1000,
            })

    }

    return (
        <>

            <details className="dropdown fixed z-20">
                <summary className="m-1 btn btn-active btn-neutral rounded"><i className="ph ph-squares-four text-2xl" ></i></summary>
                <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-72 p-2 shadow bg-base-100 text-primary-content">
                    <div className="card-body">
                        <form className="form-control " onSubmit={handleSubmit}>
                            <div className="label">
                                <label className="label-text">Query</label>
                            </div>

                            <select name="query" onChange={handleChange} className="select select-bordered w-full max-w-xs">
                                <option disabled selected>Select Query</option>
                                {
                                    queryList.map(({ label, value }, index) => (
                                        <option key={index} value={value}>{label}</option>
                                    ))
                                }
                            </select>
                            <div className="label">
                                <label className="label-text">Radius</label>
                            </div>
                            <select name="radius" onChange={handleChange} className="select select-bordered w-full max-w-xs">
                                <option disabled selected>Select Radius</option>
                                {
                                    radius.map(({ label, value }, index) => (
                                        <option key={index} value={value}>{label}</option>
                                    ))
                                }
                            </select>
                            <div className="label">
                                <label className="label-text">Forest</label>
                            </div>
                            <select name="forest" onChange={handleChange} className="select select-bordered w-full max-w-xs">
                                <option disabled selected>Select Forest</option>
                                {
                                    forestList.map(({ properties }) => (
                                        <option key={properties.id} value={properties.id}>{properties.forest}</option>
                                    ))
                                }
                            </select>

                            {
                                mutation.isPending ? (
                                    <button className="btn btn-success mt-2"><i className="ph-bold ph-funnel text-xl"></i>Loading </button>) : (
                                    <button className="btn btn-success mt-2"><i className="ph-bold ph-funnel text-xl"></i>Filter</button>
                                )

                            }
                        </form>
                    </div>
                </div>
            </details>

        </>
    )
}

export default ToolBox
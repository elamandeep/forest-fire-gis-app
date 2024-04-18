import { Map, View } from "ol";
import { create } from 'zustand'

interface IAppStore {
    mapObj: Map | null,
    view: View ,
    forestList: Array<any>,
    setMapObj: (map: Map) => void,
    setForestList: (forestDataArray: Array<any>) => void,
    setView: (view: View) => void
}

export const useAppStore = create<IAppStore>()((set, get) => ({
    mapObj: null,
    view: new View({}),
    forestList: [],
    setMapObj(map) {
        set({
            mapObj: map
        })
    },
    setForestList(forestDataArray) {
        set({
            forestList: [...get().forestList, ...forestDataArray]
        })
    },
    setView(view) {
        set({
            view
        })
    }
}))

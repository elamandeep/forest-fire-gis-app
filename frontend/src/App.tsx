import { lazy } from "react"
import { Toaster } from "react-hot-toast"
const Map = lazy(() => import("./components/MapComponent"))
const ToolBox = lazy(() => import("./components/ToolBox"))

function App() {




  return (
    <>
      <Toaster />
      <Map />
      <ToolBox />
    </>
  )
}

export default App

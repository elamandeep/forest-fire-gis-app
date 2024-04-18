import { ReactNode } from "react"

export const Alert = ({ title , icon=(<i className="ph ph-info text-xl"></i>)}: { title: string, icon?:ReactNode }) => {

    return (
        <>
            <div role="alert" className="alert alert-info w-96">
                {icon}
                <span>{title}</span>
            </div>
        </>
    )
}
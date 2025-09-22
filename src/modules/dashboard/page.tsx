import { Suspense, use } from "react"
import { invoke } from "@tauri-apps/api/core"

const fetchData = async () => {
    try {
        const response = await invoke("greet", { name: 'Dashboard' })
        return response
    } catch (error) {
        console.log(error)
        return []
    }
}

function DashboardContent ({ dataPromise }) {
    const data = use(dataPromise)
    return (
        <>Dashboard data: {JSON.stringify(data)}</>
    )
}

export default function Dashboard () {

    const dataPromise = fetchData()
    return (
        <Suspense fallback={<p>⌛Fetching data...</p>}>
            <DashboardContent dataPromise={dataPromise} />
        </Suspense>
    )
}
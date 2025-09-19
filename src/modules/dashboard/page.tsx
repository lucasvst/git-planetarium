import { invoke } from "@tauri-apps/api/core"
import { use } from "react"

const fetchData = async () => {
    try {
        const response = await invoke("foo", { name: 'dashboard' })
        return response
    } catch (error) {
        return []
    }
}

export default function Dashboard () {

    const data = use(fetchData())

    return (
      <>Dashboard data: {JSON.stringify(data)}</>
    )
}
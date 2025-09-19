import { invoke } from "@tauri-apps/api/core"
import { use } from "react"

const fetchData = async () => {
    try {
        const response = await invoke("foo", { name: 'repositories' })
        return response
    } catch (error) {
        return []
    }
}

export default function Repositories () {

    const data = use(fetchData())

    return (
      <>Repositories data: {JSON.stringify(data)}</>
    )
}
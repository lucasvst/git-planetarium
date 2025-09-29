export interface Settings {
    directoryPath?: string
}

function getSettings(): Settings {
    const settingsJSON = localStorage.getItem('settings')
    try {
        return JSON.parse(settingsJSON||'{}')
    } catch (e) {
        console.error('Error parsing settings JSON:', e)
        return {}
    }
}

function setSettings(settings: Settings): void {
    const currentSettings = getSettings()
    try {
        localStorage.setItem('settings', JSON.stringify({ ...currentSettings, ...settings }))
    } catch (e) {
        console.error('Error saving settings:', e)
    }
}


export type UseSettings = [Settings, (settings: Settings) => void]

export default function useSettings (): UseSettings {
    const settings = getSettings()
    return [
        settings,
        setSettings
    ]
}
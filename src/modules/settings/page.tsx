import React, { useState, useEffect } from 'react';

import useSettings from './../settings';

const SettingsPage: React.FC = () => {

    const [directoryPath, setDirectoryPath] = useState('');
    const [settings, setSettings] = useSettings()

    useEffect(() => {
        setDirectoryPath(settings.directoryPath||"")
    }, [settings])

    return (
        <div className="flex flex-col gap-4">

        {/* DIRECTORY */}
            <div className="flex flex-col gap-2">
                <label className="floating-label">
                <span>Directory path:</span>
                <input
                    className="input input-md"
                    type="text"
                    value={directoryPath}
                    onChange={async (e) => {
                    setDirectoryPath(e.target.value)
                    setSettings({ directoryPath: e.target.value })
                    }}
                    placeholder="/Users/your_username/projects"
                />
                </label>
            </div>
        </div>
    );
};

export default SettingsPage;

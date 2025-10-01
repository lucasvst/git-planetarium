import { Route, Routes } from "react-router"

import Full from "./layouts/full"
import Dashboard from "./modules/dashboard/page"
import RepositoryPage from "./modules/repository/page"
import SettingsPage from "./modules/settings/page"

function App () {
  return (
    <Routes>
      <Route element={<Full />}>
        <Route index element={<Dashboard />} />
        <Route path="/repositories/:name" element={<RepositoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App
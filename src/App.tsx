import { Route, Routes } from "react-router"

import Full from "./layouts/full"
import Dashboard from "./modules/dashboard/page"
import RepositoryPage from "./modules/repository/page"
import CommitPage from "./modules/commit/page"
import SettingsPage from "./modules/settings/page"

function App () {
  return (
    <Routes>
      <Route element={<Full />}>
        <Route index element={<Dashboard />} />
        <Route path="/repositories/:repositoryName" element={<RepositoryPage />} />
        <Route path="/repositories/:repositoryName/commits/:commitHash" element={<CommitPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App
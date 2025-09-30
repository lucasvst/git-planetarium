import { Route, Routes } from "react-router"

import Dashboard from "./modules/dashboard/page"
import RepositoryPage from "./modules/repository/page"
import Full from "./layouts/full";

function App () {
  return (
    <Routes>
      <Route element={<Full />}>
        <Route index element={<Dashboard />} />
        <Route path="/repositories/:name" element={<RepositoryPage />} />
      </Route>
    </Routes>
  );
}

export default App
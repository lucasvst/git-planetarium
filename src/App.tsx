import { Route, Routes } from "react-router"

import Dashboard from "./modules/dashboard/page"
import Full from "./layouts/full";

function App () {
  return (
    <Routes>
      <Route element={<Full />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App
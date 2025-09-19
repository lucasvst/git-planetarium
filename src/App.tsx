import { Link, Route, Routes } from "react-router"

import Dashboard from "./modules/dashboard/page"
import Repositories from "./modules/repositories/page"

function App () {
  return (
    <main>
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/repositories">Repositories</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="/repositories" element={<Repositories />} />
      </Routes>
    </main>
  );
}

export default App
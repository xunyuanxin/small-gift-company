import { Route, Routes } from 'react-router-dom'
import { HomePage }    from './pages/HomePage'
import { BundlesPage } from './pages/BundlesPage'
import { BundleDetail } from './components/BundleDetail'

function App() {
  return (
    <Routes>
      <Route path="/"            element={<HomePage />} />
      <Route path="/bundles"     element={<BundlesPage />} />
      <Route path="/bundles/:id" element={<BundleDetail />} />
    </Routes>
  )
}

export default App

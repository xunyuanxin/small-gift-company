import { Route, Routes } from 'react-router-dom'
import { HomePage }                from './pages/HomePage'
import { BundleCustomizationPage } from './pages/BundleCustomizationPage'

function App() {
  return (
    <Routes>
      <Route path="/"                          element={<HomePage />} />
      <Route path="/bundleCustomization/:bundleId" element={<BundleCustomizationPage />} />
    </Routes>
  )
}

export default App

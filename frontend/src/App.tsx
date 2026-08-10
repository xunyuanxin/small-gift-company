import { Route, Routes } from 'react-router-dom'
import { Container } from '@mui/material'
import { GiftFinder } from './components/GiftFinder'
import { BundleDetail } from './components/BundleDetail'

function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Routes>
        <Route path="/" element={<GiftFinder />} />
        <Route path="/bundles/:id" element={<BundleDetail />} />
      </Routes>
    </Container>
  )
}

export default App

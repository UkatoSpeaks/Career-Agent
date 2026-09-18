import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import InterviewPrepPage from './pages/InterviewPrepPage'
import ResumeGapPage from './pages/ResumeGapPage'
import RoadmapPage from './pages/RoadmapPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="resume" element={<ResumeGapPage />} />
          <Route path="interview" element={<InterviewPrepPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

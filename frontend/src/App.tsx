import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import SessionDetail from './pages/SessionDetail'
import Plugins from './pages/Plugins'
import Skills from './pages/Skills'
import Commands from './pages/Commands'
import History from './pages/History'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/sessions/:sid" element={<SessionDetail />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/commands" element={<Commands />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  )
}

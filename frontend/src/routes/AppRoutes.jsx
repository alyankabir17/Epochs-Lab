import { lazy } from 'react'
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom'
import Landing from '../pages/Landing'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import AppShell from '../pages/AppShell'
import Pipeline from '../pages/Pipeline'
import Keys from '../pages/Keys'
import Settings from '../pages/Settings'
import Datasets from '../pages/Datasets'
import DatasetExplorer from '../components/dashboard/DatasetExplorer'
import { useStore } from '../context/store'

const Dashboard = lazy(() => import('../pages/Dashboard'))

function ProjectRoute() {
  const { id } = useParams()
  return <Pipeline key={id} />
}

function DatasetRoute() {
  const { id } = useParams()
  const { datasets, projects } = useStore()
  const dataset = datasets.find((item) => item.id === id)
  if (!dataset) return <div className="surface p-6"><h1 className="text-xl font-bold">Dataset not found</h1><p className="mt-2 text-soft">Return to the dataset library to choose another dataset.</p></div>
  return <DatasetExplorer dataset={dataset} projects={projects} />
}

export default function AppRoutes() {
  return <MemoryRouter><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/app" element={<AppShell />}>
      <Route index element={<Dashboard />} />
      <Route path="projects/:id" element={<ProjectRoute />} />
      <Route path="keys" element={<Keys />} />
      <Route path="settings" element={<Settings />} />
      <Route path="datasets" element={<Datasets />} />
      <Route path="datasets/:id" element={<DatasetRoute />} />
    </Route>
  </Routes></MemoryRouter>
}

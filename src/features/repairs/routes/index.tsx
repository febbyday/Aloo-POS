import { Route, Routes } from 'react-router-dom'
import { RepairsPage } from '../pages/RepairsPage'
import { PendingRepairsPage } from '../pages/PendingRepairsPage'
import { RepairReportsPage } from '../pages/RepairReportsPage'

export function RepairRoutes() {
  return (
    <Routes>
      <Route index element={<RepairsPage />} />
      <Route path="pending" element={<PendingRepairsPage />} />
      <Route path="reports" element={<RepairReportsPage />} />
    </Routes>
  )
}

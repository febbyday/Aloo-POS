import { defaultEmploymentStatuses, type EmploymentStatus } from "../types/employmentStatus"

class EmploymentStatusService {
  private statuses: EmploymentStatus[] = defaultEmploymentStatuses

  async getAllStatuses(): Promise<EmploymentStatus[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return this.statuses
  }

  async getStatusById(id: string | number): Promise<EmploymentStatus | undefined> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return this.statuses.find(status => status.id === id)
  }

  async createStatus(status: Omit<EmploymentStatus, "id">): Promise<EmploymentStatus> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newStatus: EmploymentStatus = {
      ...status,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.statuses.push(newStatus)
    return newStatus
  }

  async updateStatus(id: string | number, status: Partial<EmploymentStatus>): Promise<EmploymentStatus> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const index = this.statuses.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error(`Employment status with id ${id} not found`)
    }
    const updatedStatus: EmploymentStatus = {
      ...this.statuses[index],
      ...status,
      updatedAt: new Date().toISOString(),
    }
    this.statuses[index] = updatedStatus
    return updatedStatus
  }

  async deleteStatus(id: string | number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const index = this.statuses.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error(`Employment status with id ${id} not found`)
    }
    this.statuses.splice(index, 1)
  }
}

export const employmentStatusService = new EmploymentStatusService()

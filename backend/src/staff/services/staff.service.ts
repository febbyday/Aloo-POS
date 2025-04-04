import { PrismaClient } from '@prisma/client';
import { Staff, CreateStaff, UpdateStaff, Shift, CreateShift, UpdateShift } from '../types/staff.types';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();
const eventEmitter = new EventEmitter();

export class StaffService {
  // Staff CRUD operations
  async createStaff(data: CreateStaff): Promise<Staff> {
    const staff = await prisma.staff.create({
      data: {
        ...data,
        code: await this.generateStaffCode(),
      },
    });

    eventEmitter.emit('StaffCreated', staff);
    return staff;
  }

  async getStaff(id: string): Promise<Staff | null> {
    return prisma.staff.findUnique({
      where: { id },
      include: {
        assignments: true,
        shifts: true,
      },
    });
  }

  async getAllStaff(): Promise<Staff[]> {
    return prisma.staff.findMany({
      include: {
        assignments: true,
        shifts: true,
      },
    });
  }

  async updateStaff(id: string, data: UpdateStaff): Promise<Staff> {
    const staff = await prisma.staff.update({
      where: { id },
      data,
    });

    eventEmitter.emit('StaffUpdated', staff);
    return staff;
  }

  async deleteStaff(id: string): Promise<void> {
    await prisma.staff.delete({
      where: { id },
    });
  }

  // Shift management
  async startShift(data: CreateShift): Promise<Shift> {
    const shift = await prisma.shift.create({
      data,
    });

    eventEmitter.emit('ShiftStarted', shift);
    return shift;
  }

  async endShift(id: string, data: UpdateShift): Promise<Shift> {
    const shift = await prisma.shift.update({
      where: { id },
      data: {
        ...data,
        endTime: new Date(),
        status: 'COMPLETED',
      },
    });

    eventEmitter.emit('ShiftEnded', shift);
    return shift;
  }

  async getStaffShifts(staffId: string): Promise<Shift[]> {
    return prisma.shift.findMany({
      where: { staffId },
      orderBy: { startTime: 'desc' },
    });
  }

  // Event handling
  on(event: string, listener: (...args: any[]) => void): void {
    eventEmitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    eventEmitter.off(event, listener);
  }

  // Utility methods
  private async generateStaffCode(): Promise<string> {
    const lastStaff = await prisma.staff.findFirst({
      orderBy: { code: 'desc' },
    });

    if (!lastStaff) {
      return 'STF001';
    }

    const lastNumber = parseInt(lastStaff.code.slice(3));
    return `STF${String(lastNumber + 1).padStart(3, '0')}`;
  }
} 
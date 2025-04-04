import { z } from 'zod';

export const StaffSchema = z.object({
  id: z.string(),
  code: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  roleId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
  assignments: z.array(z.any()).optional(),
  shifts: z.array(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateStaffSchema = StaffSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignments: true,
  shifts: true,
});

export const UpdateStaffSchema = CreateStaffSchema.partial();

export const ShiftSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  shopId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateShiftSchema = ShiftSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateShiftSchema = CreateShiftSchema.partial();

export type Staff = z.infer<typeof StaffSchema>;
export type CreateStaff = z.infer<typeof CreateStaffSchema>;
export type UpdateStaff = z.infer<typeof UpdateStaffSchema>;
export type Shift = z.infer<typeof ShiftSchema>;
export type CreateShift = z.infer<typeof CreateShiftSchema>;
export type UpdateShift = z.infer<typeof UpdateShiftSchema>; 
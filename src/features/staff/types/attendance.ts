export interface AttendanceRecord {
  id: string;
  staffId: string;
  loginTime: string;
  logoutTime?: string;
  status: 'on-time' | 'late' | 'absent' | 'left-early';
  notes?: string;
  date: string; // YYYY-MM-DD format
}

export interface StaffAttendance {
  staffId: string;
  staffName: string;
  records: AttendanceRecord[];
}

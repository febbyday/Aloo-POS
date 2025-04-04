/**
 * Staff Attendance Service
 * Handles staff attendance tracking and management
 */

import { AttendanceRecord, StaffAttendance } from "../types/attendance";
import { Staff } from "../types/staff";

// Mock data store for attendance records
let attendanceRecords: AttendanceRecord[] = [];

// Configuration for attendance rules
const attendanceConfig = {
  workStartTime: "09:00", // 9:00 AM
  lateThresholdMinutes: 15, // 15 minutes grace period
  workHours: 8, // 8 hours workday
};

/**
 * Generate random note for attendance records
 */
const generateRandomNote = (status: AttendanceRecord['status']): string => {
  const notes = {
    'late': [
      'Traffic delay',
      'Overslept',
      'Public transport issues',
      'Family emergency',
      'Doctor appointment'
    ],
    'absent': [
      'Sick leave',
      'Family emergency',
      'Personal leave',
      'Approved vacation',
      'Medical appointment'
    ],
    'left-early': [
      'Doctor appointment',
      'Family emergency',
      'Approved early departure',
      'Completed tasks early',
      'Personal emergency'
    ]
  };

  if (!notes[status as 'late' | 'absent' | 'left-early']) return '';
  
  return notes[status as 'late' | 'absent' | 'left-early'][Math.floor(Math.random() * notes[status as 'late' | 'absent' | 'left-early'].length)];
};

/**
 * Staff Attendance Service
 */
export const attendanceService = {
  /**
   * Records a staff login event and creates an attendance record
   */
  recordLogin(staffId: string): AttendanceRecord {
    const now = new Date();
    const loginTime = now.toISOString();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if there's already a login record for today
    const existingRecord = attendanceRecords.find(
      record => record.staffId === staffId && record.date === today
    );
    
    if (existingRecord) {
      // If already logged in today, just return the existing record
      return existingRecord;
    }
    
    // Determine if the login is late
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [startHour, startMinute] = attendanceConfig.workStartTime.split(':').map(Number);
    
    const totalCurrentMinutes = (currentHour * 60) + currentMinute;
    const totalStartMinutes = (startHour || 9) * 60 + (startMinute || 0);
    const minutesLate = totalCurrentMinutes - totalStartMinutes;
    
    const status = minutesLate > attendanceConfig.lateThresholdMinutes ? 'late' : 'on-time';
    
    // Create new attendance record
    const newRecord: AttendanceRecord = {
      id: `attendance-${Date.now()}`,
      staffId,
      loginTime,
      date: today,
      status,
    };
    
    // Save to our mock data store
    attendanceRecords.push(newRecord);
    
    return newRecord;
  },

  /**
   * Records a staff logout event
   */
  recordLogout(staffId: string): AttendanceRecord | null {
    const now = new Date();
    const logoutTime = now.toISOString();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Find today's login record
    const recordIndex = attendanceRecords.findIndex(
      record => record.staffId === staffId && record.date === today && !record.logoutTime
    );
    
    if (recordIndex === -1) {
      return null; // No login record found
    }
    
    // Calculate if leaving early
    const record = attendanceRecords[recordIndex];
    if (!record) return null;
    
    const loginDate = new Date(record.loginTime);
    const logoutDate = new Date(logoutTime);
    const hoursWorked = (logoutDate.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    let status = record.status;
    if (hoursWorked < attendanceConfig.workHours) {
      status = 'left-early';
    }
    
    // Update the record
    const updatedRecord: AttendanceRecord = {
      ...record,
      logoutTime,
      status,
    };
    
    attendanceRecords[recordIndex] = updatedRecord;
    
    return updatedRecord;
  },

  /**
   * Get attendance records for a specific staff member
   */
  getStaffAttendance(staffId: string): AttendanceRecord[] {
    return attendanceRecords.filter(record => record.staffId === staffId);
  },

  /**
   * Get all attendance records
   */
  getAllAttendanceRecords(): AttendanceRecord[] {
    return [...attendanceRecords];
  },

  /**
   * Update an attendance record
   */
  updateAttendanceRecord(updatedRecord: AttendanceRecord): AttendanceRecord {
    const index = attendanceRecords.findIndex(record => record.id === updatedRecord.id);
    
    if (index !== -1) {
      attendanceRecords[index] = updatedRecord;
      return updatedRecord;
    }
    
    throw new Error("Attendance record not found");
  },

  /**
   * Add a note to an attendance record
   */
  addNoteToAttendanceRecord(recordId: string, note: string): AttendanceRecord {
    const index = attendanceRecords.findIndex(record => record.id === recordId);
    
    if (index !== -1) {
      const record = attendanceRecords[index];
      if (!record) throw new Error("Attendance record not found");
      
      const updatedRecord: AttendanceRecord = {
        ...record,
        notes: note,
      };
      
      attendanceRecords[index] = updatedRecord;
      return updatedRecord;
    }
    
    throw new Error("Attendance record not found");
  },

  /**
   * Generate mock attendance data for testing
   */
  generateMockAttendanceData(staff: Staff[]): void {
    // Clear existing records
    attendanceRecords = [];
    
    // Generate 30 days of attendance data for each staff member
    const today = new Date();
    
    staff.forEach(staffMember => {
      if (!staffMember.id) return;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Skip weekends (Saturday and Sunday)
        if (date.getDay() === 0 || date.getDay() === 6) {
          continue;
        }
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Randomize login time (between 8:45 AM and 9:30 AM)
        const loginHour = 9;
        const loginMinute = Math.floor(Math.random() * 45) - 15; // -15 to +30 minutes from 9:00
        const loginDate = new Date(date);
        loginDate.setHours(loginHour, loginMinute > 0 ? loginMinute : 0);
        
        // Randomize logout time (between 5:00 PM and 6:00 PM)
        const logoutHour = 17 + Math.floor(Math.random() * 2); // 17 or 18 (5 PM or 6 PM)
        const logoutMinute = Math.floor(Math.random() * 60);
        const logoutDate = new Date(date);
        logoutDate.setHours(logoutHour, logoutMinute);
        
        // Determine status
        let status: AttendanceRecord['status'] = 'on-time';
        
        // 10% chance of being absent
        if (Math.random() < 0.1) {
          status = 'absent';
        } 
        // 20% chance of being late
        else if (loginMinute > 15 && Math.random() < 0.2) {
          status = 'late';
        }
        // 15% chance of leaving early
        else if (logoutHour < 17 && Math.random() < 0.15) {
          status = 'left-early';
        }
        
        const record: AttendanceRecord = {
          id: `attendance-${staffMember.id}-${dateStr}`,
          staffId: staffMember.id,
          date: dateStr,
          loginTime: status !== 'absent' ? loginDate.toISOString() : '',
          logoutTime: status !== 'absent' ? logoutDate.toISOString() : '',
          status,
          notes: status !== 'on-time' ? generateRandomNote(status) : '',
        };
        
        attendanceRecords.push(record);
      }
    });
  }
};

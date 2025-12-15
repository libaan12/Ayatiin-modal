export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  FINANCE = 'finance'
}

export enum SubjectLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  BOTH = 'both'
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  joinDate?: string;
}

export interface ClassEntity {
  id: string;
  name: string; // e.g. "Grade 1"
  suffix: string; // e.g. "A"
  academicYear: string;
  level: 'primary' | 'secondary';
  subjectIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  level: SubjectLevel;
}

export interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  classId: string;
  parentName: string;
  parentContact: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  studentId: string;
  classId: string;
  status: 'present' | 'absent' | 'late';
  session: 'before_break' | 'after_break';
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  maxMarks: number;
  passMarks: number;
  classIds: string[]; // Classes taking this exam
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  month: string; // "January 2024"
  status: 'paid' | 'unpaid';
  datePaid?: string;
  paymentType?: string;
  note?: string;
  schoolNameSnapshot?: string;
}

// Simplified Timetable structure for RTDB
export interface ClassTimetableData {
  id: string; // matches classId
  // Map of Day -> Array of Subject IDs (7 periods)
  // e.g. "Monday": ["sub1", "sub2", ...]
  schedule: Record<string, string[]>;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  active: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date
  end?: string;
  type: 'holiday' | 'exam' | 'event';
  description?: string;
}
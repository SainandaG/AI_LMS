// Roles available in the platform
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  MANAGEMENT = 'MANAGEMENT',
  ACCOUNTS = 'ACCOUNTS',
  CLASS_TEACHER = 'CLASS_TEACHER',
  SUBJECT_TEACHER = 'SUBJECT_TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  LIBRARIAN = 'LIBRARIAN',
  PLACEMENT_OFFICER = 'PLACEMENT_OFFICER',
  HOSTEL_WARDEN = 'HOSTEL_WARDEN',
}

// Gender enum
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

// Account status
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

// OTP purposes
export enum OtpPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_AUTH = 'TWO_FACTOR_AUTH',
}

// Content types for lessons
export enum ContentType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  SLIDE = 'SLIDE',
}

// Attendance status
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  HOLIDAY = 'HOLIDAY',
}

// Fee payment status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

// Exam types
export enum ExamType {
  UNIT_TEST = 'UNIT_TEST',
  MID_TERM = 'MID_TERM',
  FINAL = 'FINAL',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  PRACTICAL = 'PRACTICAL',
}

// Notification types
export enum NotificationType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  ATTENDANCE = 'ATTENDANCE',
  FEE_REMINDER = 'FEE_REMINDER',
  ASSIGNMENT = 'ASSIGNMENT',
  EXAM = 'EXAM',
  RESULT = 'RESULT',
  GENERAL = 'GENERAL',
}

// Submission status
export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
  RESUBMIT = 'RESUBMIT',
}

// Book status in library
export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  RESERVED = 'RESERVED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
}

// Placement status
export enum PlacementStatus {
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  ELIGIBLE = 'ELIGIBLE',
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW = 'INTERVIEW',
  OFFERED = 'OFFERED',
  PLACED = 'PLACED',
  REJECTED = 'REJECTED',
}

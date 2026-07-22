"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementStatus = exports.BookStatus = exports.SubmissionStatus = exports.NotificationType = exports.ExamType = exports.PaymentStatus = exports.AttendanceStatus = exports.ContentType = exports.OtpPurpose = exports.AccountStatus = exports.Gender = exports.UserRole = void 0;
// Roles available in the platform
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["PRINCIPAL"] = "PRINCIPAL";
    UserRole["MANAGEMENT"] = "MANAGEMENT";
    UserRole["ACCOUNTS"] = "ACCOUNTS";
    UserRole["CLASS_TEACHER"] = "CLASS_TEACHER";
    UserRole["SUBJECT_TEACHER"] = "SUBJECT_TEACHER";
    UserRole["STUDENT"] = "STUDENT";
    UserRole["PARENT"] = "PARENT";
    UserRole["LIBRARIAN"] = "LIBRARIAN";
    UserRole["PLACEMENT_OFFICER"] = "PLACEMENT_OFFICER";
    UserRole["HOSTEL_WARDEN"] = "HOSTEL_WARDEN";
})(UserRole || (exports.UserRole = UserRole = {}));
// Gender enum
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
    Gender["PREFER_NOT_TO_SAY"] = "PREFER_NOT_TO_SAY";
})(Gender || (exports.Gender = Gender = {}));
// Account status
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["INACTIVE"] = "INACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
// OTP purposes
var OtpPurpose;
(function (OtpPurpose) {
    OtpPurpose["EMAIL_VERIFICATION"] = "EMAIL_VERIFICATION";
    OtpPurpose["PASSWORD_RESET"] = "PASSWORD_RESET";
    OtpPurpose["TWO_FACTOR_AUTH"] = "TWO_FACTOR_AUTH";
})(OtpPurpose || (exports.OtpPurpose = OtpPurpose = {}));
// Content types for lessons
var ContentType;
(function (ContentType) {
    ContentType["TEXT"] = "TEXT";
    ContentType["VIDEO"] = "VIDEO";
    ContentType["PDF"] = "PDF";
    ContentType["QUIZ"] = "QUIZ";
    ContentType["ASSIGNMENT"] = "ASSIGNMENT";
    ContentType["SLIDE"] = "SLIDE";
})(ContentType || (exports.ContentType = ContentType = {}));
// Attendance status
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "PRESENT";
    AttendanceStatus["ABSENT"] = "ABSENT";
    AttendanceStatus["LATE"] = "LATE";
    AttendanceStatus["EXCUSED"] = "EXCUSED";
    AttendanceStatus["HOLIDAY"] = "HOLIDAY";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
// Fee payment status
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["PARTIAL"] = "PARTIAL";
    PaymentStatus["OVERDUE"] = "OVERDUE";
    PaymentStatus["WAIVED"] = "WAIVED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// Exam types
var ExamType;
(function (ExamType) {
    ExamType["UNIT_TEST"] = "UNIT_TEST";
    ExamType["MID_TERM"] = "MID_TERM";
    ExamType["FINAL"] = "FINAL";
    ExamType["QUIZ"] = "QUIZ";
    ExamType["ASSIGNMENT"] = "ASSIGNMENT";
    ExamType["PRACTICAL"] = "PRACTICAL";
})(ExamType || (exports.ExamType = ExamType = {}));
// Notification types
var NotificationType;
(function (NotificationType) {
    NotificationType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
    NotificationType["ATTENDANCE"] = "ATTENDANCE";
    NotificationType["FEE_REMINDER"] = "FEE_REMINDER";
    NotificationType["ASSIGNMENT"] = "ASSIGNMENT";
    NotificationType["EXAM"] = "EXAM";
    NotificationType["RESULT"] = "RESULT";
    NotificationType["GENERAL"] = "GENERAL";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// Submission status
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["PENDING"] = "PENDING";
    SubmissionStatus["SUBMITTED"] = "SUBMITTED";
    SubmissionStatus["GRADED"] = "GRADED";
    SubmissionStatus["LATE"] = "LATE";
    SubmissionStatus["RESUBMIT"] = "RESUBMIT";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
// Book status in library
var BookStatus;
(function (BookStatus) {
    BookStatus["AVAILABLE"] = "AVAILABLE";
    BookStatus["BORROWED"] = "BORROWED";
    BookStatus["RESERVED"] = "RESERVED";
    BookStatus["LOST"] = "LOST";
    BookStatus["DAMAGED"] = "DAMAGED";
})(BookStatus || (exports.BookStatus = BookStatus = {}));
// Placement status
var PlacementStatus;
(function (PlacementStatus) {
    PlacementStatus["NOT_ELIGIBLE"] = "NOT_ELIGIBLE";
    PlacementStatus["ELIGIBLE"] = "ELIGIBLE";
    PlacementStatus["APPLIED"] = "APPLIED";
    PlacementStatus["SHORTLISTED"] = "SHORTLISTED";
    PlacementStatus["INTERVIEW"] = "INTERVIEW";
    PlacementStatus["OFFERED"] = "OFFERED";
    PlacementStatus["PLACED"] = "PLACED";
    PlacementStatus["REJECTED"] = "REJECTED";
})(PlacementStatus || (exports.PlacementStatus = PlacementStatus = {}));
//# sourceMappingURL=enums.js.map
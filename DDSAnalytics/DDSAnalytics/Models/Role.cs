//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DDSAnalytics.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Role
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public Nullable<bool> CanViewDashboard { get; set; }
        public Nullable<bool> CanViewEmployees { get; set; }
        public Nullable<bool> CanViewEnrollmentList { get; set; }
        public Nullable<bool> CanViewManageSettings { get; set; }
        public Nullable<bool> CanViewAttendanceLogs { get; set; }
        public Nullable<bool> CanViewAttendanceSummaryReport { get; set; }
        public Nullable<bool> CanViewEmployeeAttendanceReport { get; set; }
        public Nullable<bool> CanViewDailyAttendanceReport { get; set; }
        public Nullable<bool> CanViewExceptionReport { get; set; }
        public Nullable<bool> CanViewLeaveReport { get; set; }
    }
}

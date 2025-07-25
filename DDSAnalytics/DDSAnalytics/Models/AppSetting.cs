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
    
    public partial class AppSetting
    {
        public int ID { get; set; }
        public string AppLogo { get; set; }
        public string CoyName { get; set; }
        public string AppName { get; set; }
        public Nullable<double> LateMinsAllowed { get; set; }
        public Nullable<double> EarlyMinsAllowed { get; set; }
        public Nullable<double> OverTimeMinsAllowed { get; set; }
        public Nullable<System.DateTime> ShiftStartTime { get; set; }
        public Nullable<System.DateTime> ShiftEndTime { get; set; }
        public Nullable<double> BeginClockInMins { get; set; }
        public Nullable<double> EndClockInMins { get; set; }
        public Nullable<double> BeginClockOutMins { get; set; }
        public Nullable<double> EndClockOutMins { get; set; }
        public Nullable<System.DateTime> ExpiryDate { get; set; }
        public string DayOff1 { get; set; }
        public string DayOff2 { get; set; }
    }
}

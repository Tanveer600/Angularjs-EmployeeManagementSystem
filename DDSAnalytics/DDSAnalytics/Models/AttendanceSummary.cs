using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.Models
{
    public class AttendanceSummary
    {
        public double Code { get; set; }
        public string Name { get; set; }
        public int MonthlyDays { get; set; }
        public int WorkingDays { get; set; }
        public int AbsentDays { get; set; }
        public int PresentDays { get; set; }
        public int InOutErrorDays { get; set; }
        public double LateMinutes { get; set; }
        public double EarlyMinutes { get; set; }
        public double TotalLateMinutes { get; set; }
        public double OvertimeMinutes { get; set; }
        public double AutoAdjustment { get; set; }
        public double OvertimeInHours { get; set; }
        public int TotalHolidays { get; set; }
    }
}
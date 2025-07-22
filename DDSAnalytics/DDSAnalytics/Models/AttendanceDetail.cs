using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.Models
{
    public class AttendanceDetail
    {
        public double EnrollNo { get; set; }
        public string EnrollName { get; set; }
        public string DepartmentName { get; set; }
        public string ShiftName { get; set; }
        public string ShiftStart { get; set; }
        public string ShiftEnd { get; set; }
        public DateTime AttDate { get; set; }
        public DateTime? ClockIn { get; set; }
        public DateTime? ClockOut { get; set; }
        public string Status { get; set; }
        public string HrsWorked { get; set; }
        public double LateMins { get; set; }
        public double EarlyMins { get; set; }
        public double OvertimeMins { get; set; }
        public string DayStatus { get; set; }

    }
}
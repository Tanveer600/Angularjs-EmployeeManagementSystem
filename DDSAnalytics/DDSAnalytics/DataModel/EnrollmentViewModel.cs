using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class EnrollmentViewModel
    {
        public int TotalEnrolled { get; set; }
        public int TodaysPresent { get; set; }
        public int TodaysAbsent { get; set; }
        public List<AttendanceDetail> attendanceList { get; set; }
        public List<MonthlyAttendanceModel> MonthlyAttendance { get; set; }

        public List<DepartmentalStatisticsModel> DepartmentalAttendance { get; set; }
    }

    public class DepartmentalStatisticsModel
    {
        public string DeptName { get; set; }
        public int TotalEnrolled { get; set; }
        public int TotalPresent { get; set; }
        public int TotalAbsent { get; set; }
    }
}
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class AttendanceDataModel
    {
        public DailyAttendance dailyAttendanceModel { get; set; }
        public Enrollment enrollmentModel { get; set; }
    }
}
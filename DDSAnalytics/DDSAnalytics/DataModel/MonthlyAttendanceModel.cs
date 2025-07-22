using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class MonthlyAttendanceModel
    {
        public string Month { get; set; } // e.g. "Jan"
        public int TotalEnrolled { get; set; }
        public int Present { get; set; }
        public int Absent { get; set; }
    }
}
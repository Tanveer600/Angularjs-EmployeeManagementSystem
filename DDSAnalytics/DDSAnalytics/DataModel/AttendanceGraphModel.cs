using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class AttendanceGraphModel
    {
        public string DepartmentName { get; set; }
        public int PresentPercentage { get; set; }
        public int LeavePercentage { get; set; }
        public int AbsentPercentage { get; set; }
        public int TotalEmployees { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Permissions;
using System.Web;

namespace DDSAnalytics.Models
{
    public class AttendanceRequestModel
    {
        public float EnrollNo { get; set; }
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public string DeviceLocation { get; set; }
        public string DeptName { get; set; }
        public string EnrollName { get; set; }
        public int LeaveTypeID { get; set; }
    }
}
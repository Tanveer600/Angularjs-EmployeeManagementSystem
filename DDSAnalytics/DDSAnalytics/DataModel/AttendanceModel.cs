using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class AttendanceModel
    {
      
        public double? EnrollNo { get; set; }
        public int? Inout { get; set; }
        public int? VerifyMode { get; set; }
        public string DeviceIP { get; set; }
        public string DeviceLocation { get; set; }
        public DateTime? AttDate { get; set; }
        public DateTime? MarkInTime { get; set; }
        public DateTime? MarkOutTime { get; set; }

        public string Description { get; set; }
        public string Status { get; set; }
        public int? EmpID { get; set; }
    }

}
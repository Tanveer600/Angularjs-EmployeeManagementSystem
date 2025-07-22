using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class LeaveDataModel
    {
        public Leave leave { get; set; }
        public Enrollment enrollment { get; set; }
        public LeaveType LeaveModel { get; set; }
        public int TotalDays { get; set; }
    }
}
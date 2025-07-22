using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class LeaveReportModel
    {

        public string LeaveTypeName { get; set; }
        public string enrollName { get; set; }
        public Double? enrollNo { get; set; }
        public string Description { get; set; }
        public string StartDate { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string EndDate { get; set; }
        public int TotalDays { get; set; } // ✅ Add this
    }
}
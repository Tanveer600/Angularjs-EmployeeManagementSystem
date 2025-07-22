using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace DDSAnalytics.API
{
    public class AttendanceLogController : ApiController
    {
        public ResponseDataModel Save(DailyAttendance model)
        {
            if (model.ID == 0) { 

            }
            else
            {

            }

            return null;
        }
    }
}
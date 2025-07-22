using DDSAnalytics.DAL;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DataModel
{
    public class UserDataModel
    {
        public User user { get; set; }
        public Role userRole { get; set; }
        public AppSetting appSettings { get; set; }
        public Enrollment currentEnrollment { get; set; }
    }
}
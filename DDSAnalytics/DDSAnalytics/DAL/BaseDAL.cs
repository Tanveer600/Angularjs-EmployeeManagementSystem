using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class BaseDAL
    {
        public DBEntities dbContext;
        public BaseDAL()
        {
            dbContext = new DBEntities();
        }
    }
}
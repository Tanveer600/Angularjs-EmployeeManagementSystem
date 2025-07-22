using DDSAnalytics.DAL;
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
    public class gazettedHolidaysController : ApiController
    {
        GazettedHolidaysDAL dal = new GazettedHolidaysDAL();

        [HttpPost]
        public ResponseDataModel Save(GazettedHoliday model)
        {
            if (model.ID > 0)
            {
                // update
                var resp = dal.Update(model);
                return resp;
            }
            else
            {
                // create
                var resp = dal.Create(model);
                return resp;
            }
        }

        
        [HttpPost]
        public ResponseDataModel Get(GazettedHoliday model)
        {
            var resp = dal.Read(model);
            return resp;

        }

        [HttpPost]
        public ResponseDataModel Remove(GazettedHoliday model)
        {
            var resp = dal.Delete(model);
            return resp;
        }
    
    }
}
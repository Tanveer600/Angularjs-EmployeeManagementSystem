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
    public class LeaveTypeController : ApiController
    {
        LeaveTypeDAL dal = new LeaveTypeDAL();

        [HttpPost]
        public ResponseDataModel Save(LeaveType model)
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
        public ResponseDataModel Get(LeaveType model)
        {
            var resp = dal.Read(model);
            return resp;

        }

        [HttpPost]
        public ResponseDataModel Remove(LeaveType model)
        {
            var resp = dal.Delete(model);
            return resp;
        }
    }
}
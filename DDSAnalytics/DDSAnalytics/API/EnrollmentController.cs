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
    public class EnrollmentController : ApiController
    {
        EnrollmentDAL dal = new EnrollmentDAL();

        [HttpPost]
        public ResponseDataModel Save(Enrollment model)
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
        public ResponseDataModel BatchSave(List<Enrollment> models)
        {
            var resp = dal.BulkSave(models);
            return resp;
        }
        [HttpPost]
        public ResponseDataModel UpdateShift(Enrollment model)
        {           
                var resp = dal.UpdateShift(model);
                return resp;                  
        }
        [HttpPost]
        public ResponseDataModel UpdateDepartment(Enrollment model)
        {
            var resp = dal.UpdateDepartment(model);
            return resp;
        }

        [HttpPost]
        public ResponseDataModel Get(Enrollment model)
        {
            var resp = dal.Read(model);
            return resp;

        }
        
        [HttpPost]
        public ResponseDataModel Remove(Enrollment model)
        {
            var resp = dal.Delete(model);
            return resp;
        }

        [HttpPost]
        public ResponseDataModel DeleteByEnrollNo(Enrollment model)
        {
            var resp = dal.DeleteByEnrollNo(model);
            return resp;
        }
    }
}
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
    public class UserRoleController : ApiController
    {
        UserRoleDAL dal = new UserRoleDAL();

        [HttpPost]
        public ResponseDataModel Save(Role model)
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
        public ResponseDataModel Get(Role model)
        {
            var resp = dal.Read(model);
            return resp;

        }

        [HttpPost]
        public ResponseDataModel Remove(Role model)
        {
            var resp = dal.Delete(model);
            return resp;
        }
    }
}

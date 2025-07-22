using DDSAnalytics.DAL;
using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System.Web.Http;

namespace DDSAnalytics.API
{
    public class UserController : ApiController
    {
        UserDAL dal = new UserDAL();

        [HttpPost]
        public ResponseDataModel Save(UserDataModel model)
        {
            if (model.user.ID > 0)
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
        public ResponseDataModel Get(User model)
        {
            var resp = dal.Read(model);
            return resp;

        }
        [HttpPost]
        public ResponseDataModel GetUserRole(Role model)
        {
            var resp = dal.ReadUserRole(model);
            return resp;

        }
        [HttpPost]
        public ResponseDataModel Remove(UserDataModel model)
        {
            var resp = dal.Delete(model);
            return resp;
        }
    }
}
using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class UserDAL : BaseDAL
    {

        public ResponseDataModel Create(UserDataModel model)
        {
            ResponseDataModel response = new ResponseDataModel();
            try
            {
                dbContext.Users.Add(model.user);
                int a = dbContext.SaveChanges();
                if (a > 0)
                {
                    response.IsSuccess = true;
                    response.Data = new List<UserDataModel> { model };
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                if (ex.InnerException != null)
                {
                    response.Message = ex.InnerException.Message;
                    response.ErrorResponse = ex.InnerException;
                }
                else
                {
                    response.IsSuccess = false;
                    response.Message = ex.Message;
                    response.ErrorResponse = ex;
                }
            }
            return response;
        }

        public ResponseDataModel Read(User model)
        {
            ResponseDataModel response = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.Users
                            select new UserDataModel
                            {
                                user = a,
                                userRole = dbContext.Roles.Where(x => x.ID == a.RoleID).FirstOrDefault(),
                                currentEnrollment = dbContext.Enrollments.Where(x => x.EnrollNo == a.EmpID).FirstOrDefault(),

                            });
                if (list != null)
                {
                    if (model != null)
                    {
                        if (model.ID > 0)
                            list = list.Where(x => x.user.ID == model.ID);

                        if (!string.IsNullOrEmpty(model.LoginID))
                            list = list.Where(x => x.user.LoginID.ToLower().StartsWith(model.LoginID.ToLower()));
                    }
                    response.IsSuccess = true;
                    response.Data = list.ToList();

                }
                else
                {
                    response.IsSuccess = true;
                    response.Data = new List<User>();
                }
            }
            catch (Exception ex)
            {

                response.IsSuccess = false;
                response.Message = ex.Message;
            }
            return response;
        }
        public ResponseDataModel Update(UserDataModel model)
        {
            ResponseDataModel response = new ResponseDataModel();
            try
            {
                var acc = (from a in dbContext.Users where a.ID == model.user.ID select a).FirstOrDefault();
                if (acc != null)
                {
               
                    acc.LoginPwd = model.user.LoginPwd;                  
                    acc.RoleID = model.user.RoleID;
                    acc.LoginID = model.user.LoginID;
                    acc.IsAdmin = model.user.IsAdmin;
                    acc.Name = model.user.Name;
                    acc.EmpID = model.user.EmpID;
                    acc.CreatedOn = model.user.CreatedOn;
                    dbContext.Entry(acc).State = System.Data.Entity.EntityState.Modified;
                    int n = dbContext.SaveChanges();

                    if (n > 0)
                    {
                        response.IsSuccess = true;
                        response.Data = new List<UserDataModel> { model };
                    }
                    else
                    {
                        response.IsSuccess = false;
                        response.Message = "Not Updated...";
                    }
                }
            }
            catch (Exception ex)
            {

                response.IsSuccess = false;
                response.Message = ex.Message;
            }
            return response;
        }
        public ResponseDataModel Delete(UserDataModel model)
        {
            ResponseDataModel response = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.Users
                           where c.ID == model.user.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        response.IsSuccess = true;
                        response.Data = new List<UserDataModel> { model };
                    }
                    else
                    {
                        response.IsSuccess = false;
                        response.Message = "Not deleted...";
                    }
                }


            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
            }

            return response;
        }
        public ResponseDataModel ReadUserRole(Role model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.Roles
                            select a);

                // check if there is any data in the database
                if (list != null)
                {
                    // check if input model is null
                    if (model != null)
                    {
                        if (model.ID > 0)
                            list = list.Where(x => x.ID == model.ID);

                        if (!string.IsNullOrEmpty(model.Name))
                            list = list.Where(x => x.Name.ToLower().StartsWith(model.Name.ToLower()));
                    }

                    resp.IsSuccess = true;
                    resp.Data = list.ToList();
                }
                else
                {
                    // just return empty list
                    resp.IsSuccess = true;
                    resp.Data = new List<Role>();
                }
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }
        public User LoginUser(string username)
        {
            ResponseDataModel responseDataModel = new ResponseDataModel();
            try
            {
                var user = (from c in dbContext.Users where c.LoginID == username select c).FirstOrDefault();
                return user;
            }
            catch (Exception)
            {

                return null;
            }
        }
    }
}
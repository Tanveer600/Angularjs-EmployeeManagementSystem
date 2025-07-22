using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class UserRoleDAL:BaseDAL
    {
        public ResponseDataModel Create(Role role)
        {
            ResponseDataModel response = new ResponseDataModel();
            try
            {
                 dbContext.Roles.Add(role);
                int n=dbContext.SaveChanges();
                if(n >0 ) {
                    response.IsSuccess = true;
                    response.Data = new List<Role> { role };
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
                    response.Message = ex.Message;
                    response.ErrorResponse = ex;
                }
                
            }
            return response;
        }
     
        //public List<RolePermission> ReadPermissionList(int roleId)
        //{
        //    List<RolePermission> permissions = new List<RolePermission>();

        //    try
        //    {
        //        permissions = (from p in dbContext.RolePermissions
        //                       where p.UserRoleID == roleId
        //                       select p).ToList();
        //    }
        //    catch (Exception ex)
        //    {
        //        // Log the error (consider using logging)
        //        Console.WriteLine(ex.Message);
        //    }

        //    return permissions;
        //}

        public Role ReadSingle(int id)
        {
            Role role = new Role();
            try
            {
                var list = (from a in dbContext.Roles
                            where a.ID == id
                            select a);

                // check if there is any data in the database
                if (list != null)
                {
                    // check if input model is null
                    role = list.FirstOrDefault();
                }
                else
                {

                }
            }
            catch (Exception ex)
            {

            }

            return role;
        }

        public ResponseDataModel Read(Role model)
        {
            ResponseDataModel response = new ResponseDataModel();
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

                    response.IsSuccess = true;
                    response.Data = list.ToList();
                }
                else
                {
                    // just return empty list
                    response.IsSuccess = true;
                    response.Data = new List<UserRoleDAL>();
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
            }

            return response;
        }


        public ResponseDataModel Update(Role model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.Roles
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {

                    obj.Name = model.Name;
                    obj.CanViewEnrollmentList = model.CanViewEnrollmentList;
                    obj.CanViewManageSettings = model.CanViewManageSettings;
                    obj.CanViewAttendanceLogs = model.CanViewAttendanceLogs;
                    obj.CanViewDashboard = model.CanViewDashboard;
                    obj.CanViewAttendanceSummaryReport = model.CanViewAttendanceSummaryReport;
                    obj.CanViewEmployeeAttendanceReport = model.CanViewEmployeeAttendanceReport;
                    obj.CanViewDailyAttendanceReport = model.CanViewDailyAttendanceReport;
                    obj.CanViewExceptionReport = model.CanViewExceptionReport;
                    obj.CanViewLeaveReport = model.CanViewLeaveReport;
                    obj.CanViewEmployees = model.CanViewEmployees;

                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;
                    int n = dbContext.SaveChanges();

                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<Role> { model };
                    }
                    else
                    {
                        resp.IsSuccess = false;
                        resp.Message = "Not Updated...";
                    }
                }
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }


            return resp;
        }

        public ResponseDataModel Delete(Role model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.Roles
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<Role> { model };
                    }
                    else
                    {
                        resp.IsSuccess = false;
                        resp.Message = "Not deleted...";
                    }
                }


            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }
    }
}
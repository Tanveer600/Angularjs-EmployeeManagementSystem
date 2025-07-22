using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class LeaveReportDAL:BaseDAL
    {
        public ResponseDataModel Create(LeaveDataModel model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {

             
                dbContext.Leaves.Add(model.leave);
                dbContext.SaveChanges();




                // Step 4: Final response preparation
                respObject.IsSuccess = true;
                respObject.Data = new List<LeaveDataModel> { model };
            }
            catch (Exception ex)
            {
                // Error handling
                respObject.IsSuccess = false;
                respObject.Message = ex.InnerException?.Message ?? ex.Message;
                respObject.ErrorResponse = ex.InnerException ?? ex;
            }

            return respObject;
        }

        public ResponseDataModel Update(LeaveDataModel model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Check if the client exists
                var obj = (from c in dbContext.Leaves
                           where c.ID == model.leave.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    obj.LeaveType = model.leave.LeaveType;
                    obj.EnrollNo = model.leave.EnrollNo;
                    obj.Description = model.leave.Description;
                    obj.StartDate = model.leave.StartDate;
                    obj.EndDate = model.leave.EndDate;
                    obj.EmpID = model.leave.EmpID;
                    obj.LeaveTypeID = model.leave.LeaveTypeID;
                   
                  
                 

                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<LeaveDataModel> { model };
                }
                else
                {
                    resp.IsSuccess = false;
                    resp.Message = "Not Updated...";
                }
            }

            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }

        public ResponseDataModel Read(Leave model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.Leaves
                            select  new LeaveDataModel
                            {
                                leave = a,
                                enrollment=dbContext.Enrollments.Where(x=>x.ID==a.EmpID).FirstOrDefault(),
                                LeaveModel = dbContext.LeaveTypes.Where(x=>x.ID==a.LeaveTypeID).FirstOrDefault(),   

                            });

                // check if there is any data in the database
                if (list != null)
                {
                    // check if input model is null
                    if (model != null)
                    {
                       
                        if (!string.IsNullOrEmpty(model.LeaveType))
                            list = list.Where(x => x.leave.LeaveType.ToLower().StartsWith(model.LeaveType.ToLower()));
                    }

                    resp.IsSuccess = true;
                    resp.Data = list.ToList();
                }
                else
                {
                    // just return empty list
                    resp.IsSuccess = true;
                    resp.Data = new List<Leave>();
                }
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }

        public List<LeaveDataModel> ReadFilterData(AttendanceRequestModel requestModel)
        {
            var list = from a in dbContext.Leaves
                       where a.StartDate >= requestModel.DateFrom && a.EndDate <= requestModel.DateTo
                       select new LeaveDataModel
                       {
                           leave = a,
                           enrollment = dbContext.Enrollments.FirstOrDefault(x => x.ID == a.EmpID),
                           LeaveModel = dbContext.LeaveTypes.FirstOrDefault(x => x.ID == a.LeaveTypeID),
                           TotalDays = (a.EndDate.HasValue && a.StartDate.HasValue)
                                       ? (DbFunctions.DiffDays(a.StartDate.Value, a.EndDate.Value)+1 ?? 0) : 0
                       };

            if (requestModel.EnrollNo > 0)
            {
                list = list.Where(x => x.leave.EnrollNo == requestModel.EnrollNo);   
            }

            if (requestModel.LeaveTypeID > 0)
            {
                list = list.Where(x => x.leave.LeaveTypeID == requestModel.LeaveTypeID);
            }

            return list.ToList();
        }




        public ResponseDataModel Delete(LeaveDataModel model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.Leaves
                           where c.ID == model.leave.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<LeaveDataModel> { model };
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
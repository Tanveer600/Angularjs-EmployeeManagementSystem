using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class LeaveTypeDAL:BaseDAL
    {
        public ResponseDataModel Create(LeaveType model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {


                dbContext.LeaveTypes.Add(model);
                dbContext.SaveChanges();




                // Step 4: Final response preparation
                respObject.IsSuccess = true;
                respObject.Data = new List<LeaveType> { model };
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

        public ResponseDataModel Update(LeaveType model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Check if the client exists
                var obj = (from c in dbContext.LeaveTypes
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    obj.LeaveTypeName = model.LeaveTypeName;
                    

                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<LeaveType> { model };
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

        public LeaveType ReadSingle(int id, string name = "")
        {
            if (id > 0)
            {
                return dbContext.LeaveTypes.FirstOrDefault(t => t.ID == id);
            }
            else if (!string.IsNullOrEmpty(name))
            {
                return dbContext.LeaveTypes.FirstOrDefault(x => x.LeaveTypeName == name);
            }
            else
                return new LeaveType { ID = 0, LeaveTypeName = "Unknown", LeaveTypeCode = "NA" };
        }

        public ResponseDataModel Read(LeaveType model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.LeaveTypes
                            select a);

                // check if there is any data in the database
                if (list != null)
                {
                    // check if input model is null
                    if (model != null)
                    {
                        if (model.ID > 0)
                            list = list.Where(x => x.ID == model.ID);

                        if (!string.IsNullOrEmpty(model.LeaveTypeName))
                            list = list.Where(x => x.LeaveTypeName.ToLower().StartsWith(model.LeaveTypeName.ToLower()));
                    }

                    resp.IsSuccess = true;
                    resp.Data = list.ToList();
                }
                else
                {
                    // just return empty list
                    resp.IsSuccess = true;
                    resp.Data = new List<LeaveType>();
                }
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }


        public ResponseDataModel Delete(LeaveType model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.LeaveTypes
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<LeaveType> { model };
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
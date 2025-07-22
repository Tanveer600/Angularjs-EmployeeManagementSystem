using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class ManualEntryReasonDAL : BaseDAL
    {
        public ResponseDataModel Create(ManualEntryReason model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {


                dbContext.ManualEntryReasons.Add(model);
                dbContext.SaveChanges();




                // Step 4: Final response preparation
                respObject.IsSuccess = true;
                respObject.Data = new List<ManualEntryReason> { model };
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

        public ResponseDataModel Update(ManualEntryReason model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Check if the client exists
                var obj = (from c in dbContext.ManualEntryReasons
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    obj.Reason = model.Reason;
                   

                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<ManualEntryReason> { model };
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
        public ResponseDataModel Read(ManualEntryReason model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.ManualEntryReasons
                            select a);

                // check if there is any data in the database
                if (list != null)
                {
                    // check if input model is null
                    if (model != null)
                    {
                        if (model.ID > 0)
                            list = list.Where(x => x.ID == model.ID);

                        if (!string.IsNullOrEmpty(model.Reason))
                            list = list.Where(x => x.Reason.ToLower().StartsWith(model.Reason.ToLower()));
                    }

                    resp.IsSuccess = true;
                    resp.Data = list.ToList();
                }
                else
                {
                    // just return empty list
                    resp.IsSuccess = true;
                    resp.Data = new List<ManualEntryReason>();
                }
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }


        public ResponseDataModel Delete(ManualEntryReason model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.ManualEntryReasons
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<ManualEntryReason> { model };
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
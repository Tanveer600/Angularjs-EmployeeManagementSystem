using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class GeneralSettingDAL:BaseDAL
    {
        public ResponseDataModel Create(AppSetting model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {

                dbContext.AppSettings.Add(model);
                dbContext.SaveChanges();




                // Step 4: Final response preparation
                respObject.IsSuccess = true;
                respObject.Data = new List<AppSetting> { model };
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

        public ResponseDataModel Update(AppSetting model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Check if the client exists
                var obj = (from c in dbContext.AppSettings
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    obj.AppLogo = model.AppLogo;
                    obj.AppName = model.AppName;
                    obj.CoyName = model.CoyName;
                    obj.EarlyMinsAllowed = model.EarlyMinsAllowed;
                    obj.LateMinsAllowed = model.LateMinsAllowed;
                    obj.EndClockOutMins = model.EndClockOutMins;
                    obj.BeginClockOutMins = model.BeginClockOutMins;
                    obj.BeginClockInMins = model.BeginClockInMins;
                    obj.EndClockInMins = model.EndClockInMins;
                    obj.OverTimeMinsAllowed = model.OverTimeMinsAllowed;
                    obj.DayOff1 = model.DayOff1;
                    obj.DayOff2 = model.DayOff2;
                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<AppSetting> { model };
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

        public AppSetting ReadSettings()
        {
            try
            {
                return dbContext.AppSettings.FirstOrDefault();
            }
            catch (Exception)
            {
                return null; // or throw if you want to catch it outside
            }
        }

        public ResponseDataModel Read(AppSetting model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.AppSettings
                            select a);

                // check if there is any data in the database
                if (list != null)
                {
                    
                    resp.IsSuccess = true;
                    resp.Data = list.ToList();
                }
                else
                {
                    // just return empty list
                    resp.IsSuccess = true;
                    resp.Data = new List<AppSetting>();
                }
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }




        public ResponseDataModel Delete(AppSetting model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.AppSettings
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<AppSetting> { model };
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
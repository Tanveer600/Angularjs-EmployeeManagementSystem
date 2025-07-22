using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class CalendarYearDAL:BaseDAL
    {
        public ResponseDataModel Create(CalendarYear model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {

              
                dbContext.CalendarYears.Add(model);
                dbContext.SaveChanges();




                // Step 4: Final response preparation
                respObject.IsSuccess = true;
                respObject.Data = new List<CalendarYear> { model };
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

        public ResponseDataModel Update(CalendarYear model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Check if the client exists
                var obj = (from c in dbContext.CalendarYears
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    obj.StartDate = model.StartDate;
                    obj.EndDate = model.EndDate;
                    obj.Title = model.Title;
                    obj.IsActive = model.IsActive;
                  
                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<CalendarYear> { model };
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

        public CalendarYear ReadActive()
        {
            return dbContext.CalendarYears.FirstOrDefault(x => x.IsActive == true);
        }
        
        public ResponseDataModel Read(CalendarYear model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.CalendarYears
                            select a);

                // check if there is any data in the database
                if (list != null)
                {
                    // check if input model is null
                    if (model != null)
                    {
                        if (model.ID > 0)
                            list = list.Where(x => x.ID == model.ID);

                        if (!string.IsNullOrEmpty(model.Title))
                            list = list.Where(x => x.Title.ToLower().StartsWith(model.Title.ToLower()));
                    }

                    resp.IsSuccess = true;
                    resp.Data = list.ToList();
                }
                else
                {
                    // just return empty list
                    resp.IsSuccess = true;
                    resp.Data = new List<Enrollment>();
                }
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.Message;
            }

            return resp;
        }


        public ResponseDataModel Delete(CalendarYear model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.CalendarYears
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<CalendarYear> { model };
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
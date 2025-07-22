using DDSAnalytics.DAL;
using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using Microsoft.Ajax.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace DDSAnalytics.API
{
    public class LeaveReportController : ApiController
    {
        LeaveReportDAL dal = new LeaveReportDAL();

        [HttpPost]
        public ResponseDataModel Save(LeaveDataModel model)
        {
            model.leave.EnrollNo = model.enrollment.EnrollNo;
            model.leave.LeaveType = model.LeaveModel.LeaveTypeName;
            
            if (model.leave.ID > 0)
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
        public ResponseDataModel Get(Leave model)
        {
            var resp = dal.Read(model);
            return resp;

        }

        [HttpPost]
        public ResponseDataModel Remove(LeaveDataModel model)
        {
            var resp = dal.Delete(model);
            return resp;
        }
        [HttpPost]
        public ResponseDataModel GetLeaveDetail(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Directly use the dates without AddDays if not needed
                req.DateFrom = req.DateFrom.AddDays(1);
                req.DateTo = req.DateTo.AddDays(1);

                var data = dal.ReadFilterData(req);

                resp.Data = data;
                resp.IsSuccess = true;
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.InnerException?.Message ?? ex.Message;
                resp.ErrorResponse = ex.InnerException ?? ex;
            }

            return resp;
        }


        //[HttpPost]
        //public ResponseDataModel GetYearlyLeave(AttendanceRequestModel req)
        //{
        //    ResponseDataModel resp = new ResponseDataModel();
        //    var currentCalendarYear = new CalendarYearDAL().ReadActive();

        //    try
        //    {
        //        req.DateFrom = currentCalendarYear.StartDate.Value;
        //        req.DateTo = currentCalendarYear.EndDate.Value; 

        //        var data = dal.ReadFilterData(req);
                
        //        resp.Data = data;
        //        resp.IsSuccess = true;
        //    }
        //    catch (Exception ex)
        //    {
        //        resp.IsSuccess = false;
        //        resp.Message = ex.InnerException?.Message ?? ex.Message;
        //        resp.ErrorResponse = ex.InnerException ?? ex;
        //    }

        //    return resp;

        //}
        [HttpPost]
        public ResponseDataModel GetYearlyLeave(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();

            try
            {
                // Get current active year
                var currentCalendarYear = new CalendarYearDAL().ReadActive();
                req.DateFrom = currentCalendarYear.StartDate.Value;
                req.DateTo = currentCalendarYear.EndDate.Value;

                // Call DAL to fetch leave data
                var data = dal.ReadFilterData(req);              
                // Transform raw data to clean model for frontend
                var mappedData = data.Select(d => new LeaveReportModel
                {
                    
                    LeaveTypeName = d.LeaveModel?.LeaveTypeName ?? "N/A",
                    enrollName = d.enrollment?.EnrollName ?? "N/A",
                    enrollNo = d.enrollment.EnrollNo,
                    Description = d.leave.Description ?? "", 
                    StartDate = d.leave.StartDate?.ToString("yyyy-MM-dd") ?? "",
                    FromDate = req.DateFrom.ToString("yyyy-MM-dd") ?? "",
                    ToDate = req.DateTo.ToString("yyyy-MM-dd") ?? "",
                    EndDate = d.leave.EndDate?.ToString("yyyy-MM-dd") ?? "",
                    TotalDays = d.TotalDays 
                }).ToList();

                resp.Data = mappedData;
                resp.IsSuccess = true;
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.InnerException?.Message ?? ex.Message;
                resp.ErrorResponse = ex.InnerException ?? ex;
            }

            return resp;
        }

    }
}
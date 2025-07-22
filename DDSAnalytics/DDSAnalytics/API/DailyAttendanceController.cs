using DDSAnalytics.DAL;
using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace DDSAnalytics.API
{
    public class DailyAttendanceController : ApiController
    {
        DailyAttendanceDAL dal = new DailyAttendanceDAL();


        [HttpPost]
        public ResponseDataModel Save(DailyAttendance model)
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
        public ResponseDataModel ManualAttendance(AttendanceModel model)
        {         
            {
                // create
                var resp = dal.ManualAttendance(model);
                return resp;
            }
        }
        

          [HttpPost]
        public ResponseDataModel BatchSave(List<DailyAttendance> models)
        {
            var resp = dal.BulkSave(models);
            return resp;

        }
        [HttpPost]
        public ResponseDataModel Get(DailyAttendance model)
        {
            var resp = dal.Read(model);
            return resp;

        }

        [HttpPost]
        public ResponseDataModel Remove(DailyAttendance model)
        {
            var resp = dal.Delete(model);
            return resp;
        }

        [HttpPost]
        public ResponseDataModel GetDateWiseAttendance(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var data = dal.GetAttendanceDetail(req.DateFrom.AddDays(1), req.DateTo.AddDays(1), req.DeptName,(int)req.EnrollNo);
                resp.Data = data;
                resp.IsSuccess = true;
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.ErrorResponse = ex;
                resp.Message = ex.Message;
            }

            return resp;
        }

        [HttpPost]
        public ResponseDataModel GetMonthlyAttendance(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var data = dal.GetAttendanceDetail(req.DateFrom.AddDays(1), req.DateTo.AddDays(1), req.DeptName, (int)req.EnrollNo);

                //1. group data by EnrollNo
                var groupedAttendance = data.GroupBy(x => x.EnrollNo).ToList();

                var attSummary = new List<AttendanceSummary>();

                foreach (var group in groupedAttendance)
                {
                    var att = new AttendanceSummary();
                    att.Code = group.Key;
                    att.Name = group.FirstOrDefault()?.EnrollName;

                    // 2. Count total days between req.DateFrom and req.DateTo as TotalDays
                    att.MonthlyDays = (req.DateTo - req.DateFrom).Days + 1;
                    // 3. Count total records of each group as WorkingDays
                    //att.WorkingDays = group.Where(x => x.Status == "Present").Count();

                    // 4. Count TotalDays - WorkingDays as AbsentDays
                    att.AbsentDays = group.Where(x => x.Status == "Absent").Count();

                    // 5. Count total records of each group as InOutErrorDays
                    var inOutExceptions = group.Count(x => x.DayStatus == "IO");
                    att.InOutErrorDays = inOutExceptions;
                    

                    att.WorkingDays = att.MonthlyDays - att.AbsentDays - att.InOutErrorDays;

                    // 6. Sum total late minutes of each group
                    att.LateMinutes = group.Sum(x => x.LateMins);

                    // 7. Sum total early minutes of each group
                    att.EarlyMinutes = group.Sum(x => x.EarlyMins);

                    att.TotalLateMinutes = att.LateMinutes + att.EarlyMinutes;

                    // 8. Sum total overtime minutes of each group
                    att.OvertimeMinutes = group.Sum(x => x.OvertimeMins);

                    att.AutoAdjustment = att.OvertimeMinutes - att.TotalLateMinutes;

                    att.OvertimeInHours = att.OvertimeMinutes / 60;

                    att.TotalHolidays = group.Count(x => x.DayStatus == "GH");

                    // Add summary data to result
                    attSummary.Add(att);
                }
                resp.Data = attSummary;
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
        [HttpPost]
        public ResponseDataModel GetEmployeesWiseDetail(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var data = dal.GetAttendanceDetail(req.DateFrom.AddDays(1), req.DateTo.AddDays(1),req.DeptName,(int)req.EnrollNo);                
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
        [HttpPost]
        public ResponseDataModel GetExceptionWiseDetail(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var data = dal.GetAttendanceDetail(req.DateFrom.AddDays(1), req.DateTo.AddDays(1),req.DeptName);
                var exceptionData = data
               .Where(x => (x.ClockIn == null) ^ (x.ClockOut == null))
               .ToList();



                resp.Data = exceptionData;
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

        [HttpPost]

        public ResponseDataModel GetCurrentAttendanceToday(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var data = dal.GetAttendanceDetail(req.DateFrom, req.DateTo);

                var today = req.DateFrom;

                var todaysPresent = data.Count(x => x.Status == "Present");

                var totalEnrolled = dal.GetTotalEnrolledCount();

                var todaysAbsent = totalEnrolled - todaysPresent;

                var employees = new EnrollmentDAL().ReadAll();
                var depts = employees.Select(x => x.DeptName).Distinct().ToList();
                List<DepartmentalStatisticsModel> deptStats = new List<DepartmentalStatisticsModel>();

                foreach (var item in depts)
                {
                    DepartmentalStatisticsModel stat = new DepartmentalStatisticsModel();
                    stat.DeptName = item;
                    stat.TotalEnrolled = employees.Count(x => x.DeptName == item);
                    stat.TotalPresent = data.Count(x => x.ClockIn != null && x.DepartmentName == item);
                    stat.TotalAbsent = stat.TotalEnrolled - stat.TotalPresent;

                    deptStats.Add(stat);
                }

                var viewModel = new EnrollmentViewModel
                {
                    TotalEnrolled = totalEnrolled,
                    TodaysPresent = todaysPresent,
                    TodaysAbsent = todaysAbsent,
                    attendanceList = data.Where(x => x.ClockIn != null).ToList(),
                    DepartmentalAttendance = deptStats
                };

                resp.Data = new List<object> { viewModel };
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

        [HttpPost]
        public ResponseDataModel GetAttendancePercentage(AttendanceRequestModel req)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                int totalDays = req.DateTo.Subtract(req.DateFrom).Days+1;

                var data = dal.GetAttendanceDetail(req.DateFrom.AddDays(1), req.DateTo.AddDays(1));
                var employees = new EnrollmentDAL().ReadAll();
                var departments = employees.Select(x => x.DeptName).Distinct().ToList();

                List<AttendanceGraphModel> chartData = new List<AttendanceGraphModel>();

                foreach (var dept in departments)
                {
                    var totalEmployees = employees.Count(x => x.DeptName == dept);
                    var deptData = data.Where(x => x.DepartmentName == dept).ToList();

                    int totalPresent = 0;

                    //1. group data by AttDate
                    var dateWiseAttData = deptData.GroupBy(x => x.AttDate).ToList();
                    totalPresent = dateWiseAttData.Sum(x => x.Count(y => y.Status == "Present"));
                    var totalOnLeave = dateWiseAttData.Sum(x => x.Count(y => y.Status == "OnLeave"));
                    //foreach (var dailyAttData in dateWiseAttData)
                    //{
                    //    totalPresent = dailyAttData.Count(x => x.Status == "Absent");
                    //}
                    int presentCount = totalPresent / totalDays;

                    int leaveCount = totalOnLeave / totalDays;
                    int absentCount = totalEmployees - presentCount - leaveCount;

                    AttendanceGraphModel model = new AttendanceGraphModel
                    {
                        DepartmentName = dept,
                        TotalEmployees = totalEmployees,
                        PresentPercentage = totalEmployees ==  0 ? 0 : (presentCount * 100 / totalEmployees),
                        LeavePercentage = totalEmployees == 0 ? 0 : (leaveCount * 100 / totalEmployees),
                        AbsentPercentage = totalEmployees == 0 ? 0 : (absentCount * 100 / totalEmployees)
                    };

                    chartData.Add(model);
                }

                resp.Data = chartData;
                resp.IsSuccess = true;
            }
            catch (Exception ex)
            {
                resp.IsSuccess = false;
                resp.Message = ex.InnerException?.Message ?? ex.Message;
            }

            return resp;
        }

    }

}


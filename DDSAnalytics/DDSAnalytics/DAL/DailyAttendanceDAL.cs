using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using Microsoft.Ajax.Utilities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net.NetworkInformation;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class DailyAttendanceDAL : BaseDAL
    {
        public ResponseDataModel ManualAttendance(AttendanceModel model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            List<DailyAttendance> createdRecords = new List<DailyAttendance>();
            try
            {
                // Save first record (MarkInTime)
                if (model.MarkInTime != null)
                {
                    var markInRecord = new DailyAttendance
                    {
                        EnrollNo = model.EnrollNo,
                        Inout = 1,
                        VerifyMode = model.VerifyMode,
                        DeviceIP = model.DeviceIP,
                        DeviceLocation = model.DeviceLocation,
                        AttDate = model.MarkInTime.Value,
                        Description = model.Description,
                        Status = model.Status,
                        EmpID = model.EmpID
                    };

                    dbContext.DailyAttendances.Add(markInRecord);
                    createdRecords.Add(markInRecord);
                }

                // Save second record (MarkOutTime)
                if (model.MarkOutTime != null)
                {
                    var markOutRecord = new DailyAttendance
                    {
                        EnrollNo = model.EnrollNo,
                        Inout = 2,
                        VerifyMode = model.VerifyMode,
                        DeviceIP = model.DeviceIP,
                        DeviceLocation = model.DeviceLocation,
                        AttDate = model.MarkOutTime.Value,
                        Description = model.Description,
                        Status = model.Status,
                        EmpID = model.EmpID
                    };

                    dbContext.DailyAttendances.Add(markOutRecord);
                    createdRecords.Add(markOutRecord);
                }

                int result = dbContext.SaveChanges();
                if (result > 0)
                {
                    respObject.IsSuccess = true;
                    respObject.Data = createdRecords;
                }
                else
                {
                    respObject.IsSuccess = false;
                    respObject.Message = "No records were saved.";
                }
            }
            catch (Exception ex)
            {
                respObject.IsSuccess = false;
                respObject.Message = ex.InnerException?.Message ?? ex.Message;
                respObject.ErrorResponse = ex.InnerException ?? ex;
            }

            return respObject;
        }

        public ResponseDataModel Create(DailyAttendance model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {

               
                dbContext.DailyAttendances.Add(model);
                dbContext.SaveChanges();




                // Step 4: Final response preparation
                respObject.IsSuccess = true;
                respObject.Data = new List<DailyAttendance> { model };
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
        public ResponseDataModel BulkSave(List<DailyAttendance> dailyAttandence)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {
               
                dbContext.DailyAttendances.AddRange(dailyAttandence);

                dbContext.SaveChanges(); 

                respObject.IsSuccess = true;
                respObject.Data = dailyAttandence;
            }
            catch (Exception ex)
            {
                respObject.IsSuccess = false;
                respObject.Message = ex.InnerException?.Message ?? ex.Message;
                respObject.ErrorResponse = ex.InnerException ?? ex;
            }

            return respObject;
        }
        public ResponseDataModel Read(DailyAttendance model)
        {
            ResponseDataModel response = new ResponseDataModel();
            try
            {
               // model.AttDate = model.AttDate.Value.AddDays(1);
                var query = (from a in dbContext.DailyAttendances
                             where DbFunctions.TruncateTime(a.AttDate) == DbFunctions.TruncateTime(model.AttDate)
                             orderby a.AttDate descending
                             select new AttendanceDataModel
                             {
                                 dailyAttendanceModel = a,
                                 enrollmentModel = dbContext.Enrollments
                                     .Where(x => x.EnrollNo == a.EnrollNo)
                                     .FirstOrDefault(),
                             });

                var list = query.ToList(); 

                if (model != null && model.ID > 0)
                {
                    list = list.ToList();
                }

                response.IsSuccess = true;
                response.Data = list;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.InnerException?.Message ?? ex.Message;
                response.ErrorResponse = ex.InnerException ?? ex;
            }
            return response;
        }
        //public ResponseDataModel Read(DailyAttendance model)
        //{
        //    ResponseDataModel resp = new ResponseDataModel();
        //    try
        //    {
        //        var list = (from a in dbContext.DailyAttendances
        //                    select a);

        //        // check if there is any data in the database
        //        if (list != null)
        //        {
        //            // check if input model is null
        //            if (model != null)
        //            {
        //                if (model.ID > 0)
        //                    list = list.Where(x => x.ID == model.ID);


        //            }

        //            resp.IsSuccess = true;
        //            resp.Data = list.ToList();
        //        }
        //        else
        //        {
        //            // just return empty list
        //            resp.IsSuccess = true;
        //            resp.Data = new List<DailyAttendance>();
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        resp.IsSuccess = false;
        //        resp.Message = ex.Message;
        //    }

        //    return resp;
        //}





        public ResponseDataModel Update(DailyAttendance model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.DailyAttendances
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {

                    obj.AttDate = model.AttDate;
                    obj.Inout = model.Inout;
                    obj.DeviceLocation = model.DeviceLocation;
                    obj.DeviceIP = model.DeviceIP;
                    obj.VerifyMode = model.VerifyMode;
                    obj.EnrollNo = model.EnrollNo;
                    obj.Description = model.Description;
                    obj.Status = model.Status;
                    obj.EmpID = model.EmpID;




                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;
                    int n = dbContext.SaveChanges();

                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<DailyAttendance> { model };
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
                resp.Message = ex.InnerException?.Message ?? ex.Message;
                resp.ErrorResponse = ex.InnerException ?? ex;
            }


            return resp;
        }

        public ResponseDataModel Delete(DailyAttendance model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.DailyAttendances
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<DailyAttendance> { model };
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
                resp.Message = ex.InnerException?.Message ?? ex.Message;
                resp.ErrorResponse = ex.InnerException ?? ex;
            }

            return resp;
        }
        public int GetTotalEnrolledCount()
        {
            return dbContext.Enrollments
                .Select(x => x.EnrollNo)               
                .Count();
        }

        public int GetTotalEnrolledsCount(DateTime start, DateTime end)
        {
            return dbContext.Enrollments
                .Where(e => e.RegisteredOn <= end)
                .Count();
        }


        public List<AttendanceDetail> GetAttendanceDetail(DateTime fromDate, DateTime toDate, string deptName = "", int enrollNo = 0)
        {
            var list = new List<AttendanceDetail>();

            try
            {
                if (deptName == "All")
                    deptName = "";

                // Find missing dates between fromDate and toDate
                var allDates = Enumerable.Range(0, (toDate - fromDate).Days + 1)
                                         .Select(d => fromDate.AddDays(d).Date)
                                         .ToList();

                var employees = dbContext.Enrollments.ToList();
                if (!string.IsNullOrEmpty(deptName))
                    employees = employees.Where(x => x.DeptName == deptName).ToList();

                if (enrollNo > 0)
                    employees = employees.Where(x => x.EnrollNo == enrollNo).ToList();

                var startDate = new DateTime(fromDate.Year, fromDate.Month, fromDate.Day);
                var endDate = new DateTime(toDate.Year, toDate.Month, toDate.Day);

                var gSettings = dbContext.AppSettings.FirstOrDefault();

                // find public holidays
                var holidays = (from h in dbContext.GazettedHolidays
                                select h).ToList();

                // Create HashSets of holidays for quick lookup
                var holidayDates = new HashSet<DateTime>(holidays.SelectMany(h => Enumerable.Range(0, (h.EndDate - h.StartDate).Value.Days + 1)
                    .Select(offset => h.StartDate.Value.AddDays(offset))));


                var allLogs = (from a in dbContext.DailyAttendances
                               where DbFunctions.TruncateTime(a.AttDate) >= startDate
                                     && DbFunctions.TruncateTime(a.AttDate) <= endDate
                               select a).ToList();
                               
                foreach (var employee in employees)
                {
                    var empLeaves = (from a in dbContext.Leaves
                                  where a.EnrollNo == employee.EnrollNo
                                  && DbFunctions.TruncateTime(a.StartDate) >= startDate
                                     && DbFunctions.TruncateTime(a.StartDate) <= endDate
                                     select a).ToList();

                    // create dictionary of date and leavetypes
                    var leaveDates = new Dictionary<DateTime, LeaveType>();
                    foreach (var leave in empLeaves)
                    {
                        for (var d = leave.StartDate; d <= leave.EndDate; d = d.Value.AddDays(1))
                        {
                            leaveDates[d.Value] = new LeaveTypeDAL().ReadSingle((int)leave.LeaveTypeID, leave.LeaveType);
                        }
                    }

                    var logs = (from a in allLogs
                                where a.EnrollNo == employee.EnrollNo
                                orderby a.AttDate
                                select a).ToList();

                    var shiftStart = employee.ShiftStart;
                    var shiftEnd = employee.ShiftEnd;
                    var lateComingAllowed = 15;
                    var earlyLeavingAllowed = 15;
                    var overTimeAllowed = 30;

                    // define Clocking Range with default values
                    DateTime minClockIn = new DateTime(DateTime.Today.Year,DateTime.Today.Month,DateTime.Today.Day,9,0,0);
                    DateTime maxClockIn = new DateTime(DateTime.Today.Year, DateTime.Today.Month, DateTime.Today.Day, 9, 0, 0);
                    DateTime minClockOut = new DateTime(DateTime.Today.Year, DateTime.Today.Month, DateTime.Today.Day, 17, 30, 0);
                    DateTime maxClockOut = new DateTime(DateTime.Today.Year, DateTime.Today.Month, DateTime.Today.Day, 17, 30, 0);

                    if (shiftStart != null && shiftEnd != null)
                    {
                        minClockIn = shiftStart.Value.AddHours(-2);
                        maxClockIn = shiftStart.Value.AddHours(4);
                        minClockOut = shiftEnd.Value.AddHours(-2);
                        maxClockOut = shiftEnd.Value.AddHours(6);

                    }

                    if (gSettings != null)
                    {
                        // read settings

                        if (shiftStart == null) { shiftStart = gSettings.ShiftStartTime; }
                        if (shiftEnd == null) { shiftEnd = gSettings.ShiftEndTime; }

                        minClockIn = gSettings.BeginClockInMins > 0 ? shiftStart.Value.AddMinutes(-gSettings.BeginClockInMins.Value) : minClockIn;
                        maxClockIn = gSettings.EndClockInMins > 0 ? shiftStart.Value.AddMinutes(gSettings.EndClockInMins.Value) : maxClockIn;

                        minClockOut = gSettings.BeginClockOutMins > 0 ? shiftEnd.Value.AddMinutes(-gSettings.BeginClockOutMins.Value) : minClockOut;
                        maxClockOut = gSettings.EndClockOutMins > 0 ? shiftEnd.Value.AddMinutes(gSettings.EndClockOutMins.Value) : maxClockOut;

                        lateComingAllowed = (int)gSettings.LateMinsAllowed;
                        earlyLeavingAllowed = (int)gSettings.EarlyMinsAllowed;
                        overTimeAllowed = (int)gSettings.OverTimeMinsAllowed;
                    }
                    

                    // find attendance of the current employee
                        DailyAttendance clockIn = null;
                        DailyAttendance clockOut = null;

                        // Group logs by AttDate
                        var groupedLogs = logs.GroupBy(x => x.AttDate.Value.Date);
                        var empAttList = new List<AttendanceDetail>();

                        foreach (var group in groupedLogs)
                        {
                            
                            var attLog = new AttendanceDetail
                            {
                                EnrollNo = (double)employee.EnrollNo,
                                EnrollName = employee.EnrollName,
                                DepartmentName = employee.DeptName,
                                ShiftName = employee.ShiftName,
                                ShiftStart = shiftStart != null ? shiftStart.Value.ToShortTimeString() : "",
                                ShiftEnd = shiftEnd != null ? shiftEnd.Value.ToShortTimeString() : "",
                                AttDate = group.Key,
                                ClockIn = null,
                                ClockOut = null,
                                HrsWorked = "00:00",
                                LateMins = 0,
                                EarlyMins = 0,
                                Status="",
                                DayStatus = ""
                                
                            };

                            // Find ClockIn and ClockOut
                            clockIn = group.Where(log => log.AttDate.Value.TimeOfDay >= minClockIn.TimeOfDay && log.AttDate.Value.TimeOfDay <= maxClockIn.TimeOfDay)
                                               .OrderBy(log => log.AttDate)
                                               .FirstOrDefault();

                            clockOut = group.Where(log => log.AttDate.Value.TimeOfDay >= minClockOut.TimeOfDay && log.AttDate.Value.TimeOfDay <= maxClockOut.TimeOfDay)
                                                .OrderByDescending(log => log.AttDate)
                                                .FirstOrDefault();

                            if (clockIn != null) attLog.ClockIn = clockIn.AttDate.Value;
                            if (clockOut != null) attLog.ClockOut = clockOut.AttDate.Value;

                        // Calculate Hours Worked and Overtime
                        if (clockIn != null && clockOut != null)
                        {

                            var hoursWorked = clockOut.AttDate.Value - clockIn.AttDate.Value;
                            attLog.HrsWorked = hoursWorked.ToString();
                            attLog.Status = "Present";
                            attLog.DayStatus = "PP";

                            // Calculate Overtime
                            var shiftDuration = (shiftEnd.Value - shiftStart.Value).TotalMinutes;
                            var overTimeMinutes = hoursWorked.TotalMinutes - (shiftDuration + overTimeAllowed);
                            //if (overTimeMinutes > 0)
                            //{
                            //    attLog.OvertimeMins = overTimeMinutes;

                            //    // find early coming minutes
                            //    if (clockIn.AttDate.Value.TimeOfDay < shiftStart.Value.TimeOfDay)
                            //    {
                            //        var earlyArrival = (shiftStart.Value - clockIn.AttDate.Value).TotalMinutes;
                            //        attLog.OvertimeMins = attLog.OvertimeMins - earlyArrival;
                            //        attLog.DayStatus = "OT";
                            //    }
                            //}

                            var diff = (clockOut.AttDate.Value.TimeOfDay - shiftEnd.Value.TimeOfDay).TotalMinutes;
                            if (diff > 0)
                                attLog.OvertimeMins = diff;
                            else
                                attLog.OvertimeMins = 0;
                        }

                        // Calculate Late Coming
                        if (clockIn != null)
                        {

                            var lateMinutes = (clockIn.AttDate.Value.TimeOfDay - shiftStart.Value.TimeOfDay).TotalMinutes;
                            if (lateMinutes > lateComingAllowed)
                            {
                                attLog.LateMins = lateMinutes;
                                attLog.Status = "Late-Arrival";
                                attLog.DayStatus = "LA";
                            }

                            if (clockOut == null)
                                attLog.DayStatus = "IO";
                        }

                        // Calculate Early Leaving
                        if (clockOut != null)
                        {

                            var earlyMinutes = (shiftEnd.Value.TimeOfDay - clockOut.AttDate.Value.TimeOfDay).TotalMinutes;
                            if (earlyMinutes > earlyLeavingAllowed)
                            {
                                attLog.EarlyMins = earlyMinutes;
                                attLog.Status = "Early-Departure";
                                attLog.DayStatus = "ED";
                            }

                            if (clockIn == null)
                                attLog.DayStatus = "IO";
                        }

                        // check status
                            if(clockIn != null)
                            {
                                attLog.Status = !string.IsNullOrEmpty(clockIn.Status) ? clockIn.Status : attLog.Status;
                                if(clockOut != null)
                                {
                                    attLog.Status= !string.IsNullOrEmpty(clockOut.Status) ? clockIn.Status :attLog.Status;
                                }
                            }

                            empAttList.Add(attLog);
                            list.Add(attLog);
                        }

                                                
                        var recordedDates = list.Where(x => x.EnrollNo == employee.EnrollNo).Select(l => l.AttDate.Date).Distinct().ToList();

                        var missingDates = allDates.Except(recordedDates).ToList();



                    foreach (var pDate in allDates)
                    {
                        var log = list.FirstOrDefault(x => x.AttDate.Date == pDate.Date && x.EnrollNo == employee.EnrollNo);
                        if (log == null)
                        {
                            // check if this is Off day, holiday or leave
                            string status = "";
                            string dStatus = "";

                            // Check if off day
                            if (pDate.DayOfWeek.ToString() == gSettings.DayOff1.Trim() ||
                                pDate.DayOfWeek.ToString() == gSettings.DayOff2.Trim())
                            {
                                status = "Off-Day";
                                dStatus = "OD";
                            }
                            // Check if holiday
                            else if (holidayDates.Contains(pDate.Date))
                            {
                                status = holidays.First(h => h.StartDate <= pDate && h.EndDate >= pDate).Name;
                                dStatus = "GH";
                            }
                            // Check if leave
                            else if (leaveDates.ContainsKey(pDate.Date))
                            {
                                var lt = leaveDates[pDate.Date];
                                status = lt.LeaveTypeName;
                                dStatus = lt.LeaveTypeCode;
                            }
                            else
                            {
                                status = "Absent";
                                dStatus = "AA";
                            }

                            // Add to the list
                            list.Add(new AttendanceDetail
                            {
                                EnrollNo = (double)employee.EnrollNo,
                                EnrollName = employee.EnrollName,
                                DepartmentName = employee.DeptName,
                                ShiftName = employee.ShiftName,
                                ShiftStart = shiftStart?.ToShortTimeString() ?? "",
                                ShiftEnd = shiftEnd?.ToShortTimeString() ?? "",
                                AttDate = pDate,
                                Status = status,
                                DayStatus = dStatus
                            });

                        }
                        else
                        {
                            // check if this was off day, holiday
                            // check for holiday if yes then count total work as OT
                            if (pDate.DayOfWeek.ToString() == gSettings.DayOff1.Trim() ||
                                pDate.DayOfWeek.ToString() == gSettings.DayOff2.Trim() ||
                                    holidayDates.Contains(pDate.Date))
                            {

                                if (log.ClockIn != null && log.ClockOut != null)
                                {

                                    // Calculate Hours Worked
                                    var hoursWorked = log.ClockOut.Value - log.ClockIn.Value;

                                    // Calculate Overtime
                                    var overTimeMinutes = hoursWorked.TotalMinutes;
                                    if (overTimeMinutes > 0)
                                    {
                                        log.OvertimeMins = overTimeMinutes;
                                        if (pDate.DayOfWeek.ToString() == gSettings.DayOff1.Trim() || pDate.DayOfWeek.ToString() == gSettings.DayOff2.Trim())
                                        {
                                            log.Status = "Off-Day";
                                            log.DayStatus = "OD";
                                        }
                                        else
                                        {
                                            log.Status = holidays.First(h => h.StartDate <= pDate && h.EndDate >= pDate).Name;
                                            log.DayStatus = "GH";
                                        }
                                    }
                                }
                            }
                        }

                    }

                        //// Process missing dates
                        //foreach (var missingDate in missingDates)
                        //{
                        //    string status = "";
                        //    string dStatus = "";

                        //    // Check if off day
                        //    if (missingDate.DayOfWeek.ToString() == gSettings.DayOff1.Trim() ||
                        //        missingDate.DayOfWeek.ToString() == gSettings.DayOff2.Trim())
                        //    {
                        //        status = "Off-Day";
                        //        dStatus = "OD";
                        //    }
                        //    // Check if holiday
                        //    else if (holidayDates.Contains(missingDate.Date))
                        //    {
                        //        status = holidays.First(h => h.StartDate <= missingDate && h.EndDate >= missingDate).Name;
                        //        dStatus = "GH";
                        //    }
                        //    // Check if leave
                        //    else if (leaveDates.ContainsKey(missingDate.Date))
                        //    {
                        //        var lt = leaveDates[missingDate.Date];
                        //        status = lt.LeaveTypeName;
                        //        dStatus = lt.LeaveTypeCode;
                        //    }
                        //    else
                        //    {
                        //        status = "Absent";
                        //        dStatus = "AA";
                        //    }

                        //    // Add to the list
                        //    list.Add(new AttendanceDetail
                        //    {
                        //        EnrollNo = (double)employee.EnrollNo,
                        //        EnrollName = employee.EnrollName,
                        //        DepartmentName = employee.DeptName,
                        //        ShiftName = employee.ShiftName,
                        //        ShiftStart = shiftStart?.ToShortTimeString() ?? "",
                        //        ShiftEnd = shiftEnd?.ToShortTimeString() ?? "",
                        //        AttDate = missingDate,
                        //        Status = status
                        //    });
                        //}

                        
                }
            }
            catch (Exception ex)
            {
                // Log exception details if needed
                return null;
            }

            return list.OrderBy(x => x.AttDate).ToList();
        }
    }
}

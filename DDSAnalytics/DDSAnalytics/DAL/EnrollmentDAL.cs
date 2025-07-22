using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;

namespace DDSAnalytics.DAL
{
    public class EnrollmentDAL:BaseDAL
    {
        public ResponseDataModel Create(Enrollment model)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {

                if (model.RegisteredOn == null) { model.RegisteredOn = DateTime.UtcNow; }
                dbContext.Enrollments.Add(model);
                dbContext.SaveChanges(); 

               

              
                // Step 4: Final response preparation
                respObject.IsSuccess = true;
                respObject.Data = new List<Enrollment> { model };
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

        public ResponseDataModel Update(Enrollment model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Check if the client exists
                var obj = (from c in dbContext.Enrollments
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    obj.DeptName = model.DeptName;
                    obj.ShiftEnd = model.ShiftEnd;
                    obj.ShiftStart = model.ShiftStart;
                    obj.ShiftName = model.ShiftName;
                    obj.EnrollNo = model.EnrollNo;
                    obj.EnrollName = model.EnrollName;
                    obj.MinShiftEnd = model.MinShiftEnd;
                    obj.MinShiftStart = model.MinShiftStart;
                    obj.MaxShiftStart = model.MaxShiftStart;
                    obj.MaxShiftEnd = model.MaxShiftEnd;
                    obj.ShiftDayChange = model.ShiftDayChange;
                    obj.RegisteredOn = model.RegisteredOn;




                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<Enrollment> { model };
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
        public ResponseDataModel BulkSave(List<Enrollment> enrollments)
        {
            ResponseDataModel respObject = new ResponseDataModel();
            try
            {
                foreach (var enrollment in enrollments)
                {
                   
                    var existingEnrollment = dbContext.Enrollments
                            .FirstOrDefault(e => e.EnrollNo == enrollment.EnrollNo);
                    if (existingEnrollment != null)
                    {
                        existingEnrollment.DeptName = enrollment.DeptName;
                        existingEnrollment.ShiftEnd = enrollment.ShiftEnd;
                        existingEnrollment.ShiftStart = enrollment.ShiftStart;
                        existingEnrollment.ShiftName = enrollment.ShiftName;
                        existingEnrollment.MinShiftEnd = enrollment.MinShiftEnd;
                        existingEnrollment.MinShiftStart = enrollment.MinShiftStart;
                        existingEnrollment.MaxShiftStart = enrollment.MaxShiftStart;
                        existingEnrollment.MaxShiftEnd = enrollment.MaxShiftEnd;
                        existingEnrollment.ShiftDayChange = enrollment.ShiftDayChange;
                        dbContext.Entry(existingEnrollment).State = System.Data.Entity.EntityState.Modified;
                    }
                    else
                    {
                        if (enrollment.RegisteredOn == null) { enrollment.RegisteredOn = DateTime.UtcNow; }
                        dbContext.Enrollments.Add(enrollment);
                    }
                }

                dbContext.SaveChanges(); 

                respObject.IsSuccess = true;
                respObject.Data = enrollments;
            }
            catch (Exception ex)
            {
                respObject.IsSuccess = false;
                respObject.Message = ex.InnerException?.Message ?? ex.Message;
                respObject.ErrorResponse = ex.InnerException ?? ex;
            }

            return respObject;
        }

        public ResponseDataModel UpdateDepartment(Enrollment model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {              
                var obj = (from c in dbContext.Enrollments
                           where c.EnrollNo == model.EnrollNo
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    obj.DeptName = model.DeptName;
                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<Enrollment> { model };
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
        public ResponseDataModel UpdateShift(Enrollment model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                // Check if the client exists
                var obj = (from c in dbContext.Enrollments
                           where c.EnrollNo == model.EnrollNo
                           select c).FirstOrDefault();

                if (obj != null)
                {                   
                    obj.ShiftEnd = model.ShiftEnd;
                    obj.ShiftStart = model.ShiftStart;
                    obj.ShiftName = model.ShiftName;                  
                    obj.MinShiftEnd = model.MinShiftEnd;
                    obj.MinShiftStart = model.MinShiftStart;
                    obj.MaxShiftStart = model.MaxShiftStart;
                    obj.MaxShiftEnd = model.MaxShiftEnd;
                    obj.ShiftDayChange = model.ShiftDayChange;
                }

                dbContext.Entry(obj).State = System.Data.Entity.EntityState.Modified;

                int n = dbContext.SaveChanges();

                if (n > 0)
                {
                    resp.IsSuccess = true;
                    resp.Data = new List<Enrollment> { model };
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
        
        public List<Enrollment> ReadAll()
        {
            var list = (from a in dbContext.Enrollments
                        select a).ToList();

            return list;
        }

        public ResponseDataModel Read(Enrollment model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var list = (from a in dbContext.Enrollments
                            select a);

                // check if there is any data in the database
                if (list != null)
                {
                    // check if input model is null
                    if (model != null)
                    {
                        if (model.ID > 0)
                            list = list.Where(x => x.ID == model.ID);

                        if (!string.IsNullOrEmpty(model.EnrollName))
                            list = list.Where(x => x.EnrollName.ToLower().StartsWith(model.EnrollName.ToLower()));
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




        public ResponseDataModel Delete(Enrollment model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.Enrollments
                           where c.ID == model.ID
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<Enrollment> { model };
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
        public ResponseDataModel DeleteByEnrollNo(Enrollment model)
        {
            ResponseDataModel resp = new ResponseDataModel();
            try
            {
                var obj = (from c in dbContext.Enrollments
                           where c.EnrollNo == model.EnrollNo
                           select c).FirstOrDefault();

                if (obj != null)
                {
                    dbContext.Entry(obj).State = System.Data.Entity.EntityState.Deleted;
                    int n = dbContext.SaveChanges();
                    if (n > 0)
                    {
                        resp.IsSuccess = true;
                        resp.Data = new List<Enrollment> { model };
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
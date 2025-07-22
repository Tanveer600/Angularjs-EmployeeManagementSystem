using DDSAnalytics.DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DDSAnalytics.Controllers
{
    public class ExceptionReportController : Controller
    {
        // GET: ExceptionReport
        public ActionResult Index()
        {
            ViewBag.MenuName = "ExceptionReport";
            if (Session["User"] == null)
            {
                return RedirectToAction("Login", "Home");
            }
            var user = Session["user"] as UserDataModel;
            if (user != null && user.appSettings != null && user.appSettings.ExpiryDate <= DateTime.Now)
            {
                ViewBag.CurrentUser = user;
            }
            return View();
        }
    }
}
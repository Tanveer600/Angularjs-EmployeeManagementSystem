using DDSAnalytics.DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DDSAnalytics.Controllers
{
    public class AddEditLeavesController : Controller
    {
        // GET: AddEditLeaves
        public ActionResult Index()
        {
            ViewBag.MenuName = "AddEditLeaves";
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
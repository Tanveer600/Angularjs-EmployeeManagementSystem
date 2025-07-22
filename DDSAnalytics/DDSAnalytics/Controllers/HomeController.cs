using DDSAnalytics.DAL;
using DDSAnalytics.DataModel;
using DDSAnalytics.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DDSAnalytics.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.MenuName = "Dashboard";
            ViewBag.SubMenu = "";
            ViewBag.Title = "Home Page";
            if (Session["User"] == null)
            {
                return RedirectToAction("Login");
            }
            var user = Session["user"]as UserDataModel;

           
            if (user != null && user.appSettings != null && user.appSettings.ExpiryDate <= DateTime.Now)
            {
                ViewBag.CurrentUser = user;
               

            }
            return View();
        }
        public ActionResult Login()
        {
            ViewBag.Title = "Login Page";

            return View();
        }
        [HttpPost]
        public ActionResult Login(string _loginName, string _password)
        {
            var user = new UserDAL().LoginUser(_loginName);
            if (user != null && user.LoginPwd == _password)
            {
                var _userRole = new UserRoleDAL().ReadSingle((int)user.RoleID);
                var expirySetting = new GeneralSettingDAL().ReadSettings();
              
              
                UserDataModel model = new UserDataModel
                {
                    user = user,
                    userRole = _userRole, 
                    appSettings= expirySetting
                };
                Session["User"] = model; // Store the entire UserDataModel in session
                ViewBag.Message = "Login successful!";
                ViewBag.MessageClass = "alert alert-success";

                return RedirectToAction("Index", "Home");
            }

            // Show error message if login fails
            ViewBag.Message = "Incorrect username or password.";
            ViewBag.MessageClass = "alert alert-danger";
            ViewBag.IsSend = true;
            return View();
        }

        public ActionResult Logout()
        {
            Session["User"] = null;
            return Index();
        }

        public ActionResult Settings()
        {
            ViewBag.MenuName = "Settings";
            ViewBag.SubMenu = "";
            ViewBag.Title = "DDS Analytix Settings";
            if (Session["User"] == null)
            {
                return RedirectToAction("Login");
            }
            var user = Session["user"] as UserDataModel;
            if (user != null)
            {
                ViewBag.CurrentUser = user;
            }
            return View();
        }
    }
}

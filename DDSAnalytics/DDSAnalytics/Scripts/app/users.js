myApp.controller('userController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false; 
    $scope.userList = [];
    $scope.roleList = [];
    $scope.currentUser = { user: {} };
    $scope.isSortedAsc = true;
    $scope.isLoading = false;
    $scope.pageSize = 10;
    //$scope.currentPage = 1;
    $scope.updatePageSize = function () {
    };

    Init();
    function Init() {

        // Ensure roles are fetched before users
        getUserRoleData();
        getUserData();
        getAllEnrollments();

    }
    function getAllEnrollments() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/Enrollment/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.enrollmentList = resp.Data;
                // console.log("enrollmentList", $scope.clientList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    }
    function getUserRoleData() {
        $http({
            method: "POST",
            url: "/api/User/GetUserRole",
            data: null
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {

                $scope.roleList = resp.Data;
                console.info("USER ROLE", $scope.roleList);
            }

        },
            function (er) {
                alert("data not found", er);
            }
        );
    };
    function getUserData() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/User/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {

                $scope.userList = resp.Data;
                console.info("userlist", $scope.userList);
            }
        },
            function (er) {
                alert("data not found", er);
            }
        );
    };




    $scope.selectedRole = null;
    $scope.onRoleSelect = function (selectedRole) {
        if (selectedRole) {
            // console.info(" $scope.selectedRole", $scope.selectedRole);
            $scope.currentUser = $scope.currentUser || {};
            $scope.currentUser.user = $scope.currentUser.user || {};// Ensure currentUser is initialized
            $scope.currentUser.user.RoleID = selectedRole.ID;   // Set the Role to the Name of the selectedRole
            console.info("Roles", $scope.currentUser.user.RoleID)
        } else {
            console.log("No role selected.");
        }
    };

    $scope.selectedEnrollment = null;
    $scope.onEnrollSelect = function (selectedEnrollment) {
        if (selectedEnrollment) {
            console.info(" $scope.selectedEnrollment", $scope.selectedEnrollment);
            $scope.currentUser = $scope.currentUser || {};
            $scope.currentUser.user = $scope.currentUser.user || {};
            $scope.currentUser.user.EmpID = selectedEnrollment.EnrollNo;  
            console.info("Roles", $scope.currentUser.user.RoleID)
        } else {
            console.log("No role selected.");
        }
    };

    //save data 
    $scope.save = function () {
        console.log("Current User before save:", $scope.currentUser); // Log to confirm RoleID is present
        $http({
            method: "POST",
            url: "/api/User/Save",
            data: $scope.currentUser,
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                $scope.userList = resp.Data;
                if ($scope.editMode == false) {
                    Swal.fire({
                        title: "User Save Successfully!",
                        text: "Selected User has been Saved.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                } else {
                    Swal.fire({
                        title: "User Updated Successfully!",
                        text: "Selected User Row has been Updated.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                }
                $('#showUserModal').modal('hide');
                getUserData();

                // Redirect to home/login page
                //$window.location.href = '/home/login';
            }
        }, function (er) {
            $window.alert("No work has been done", er);
        });
    };



    $scope.getEdit = function (u) {
        $scope.currentUser = angular.copy(u); // Make a copy of the user object
        $scope.editMode = true;

       
        $scope.selectedRole = $scope.roleList.find(role => role.ID === u.user.RoleID);
        $scope.selectedEnrollment = $scope.enrollmentList.find(enroll => enroll.ID === u.user.EmpID);
        console.info("$scope.selectedEnrollment", $scope.selectedEnrollment)
        console.info("$scope.selectedRole", $scope.selectedRole)
            ;
    };


    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.currentUser = {};

    }


    $scope.getDelete = function (u) {
        $scope.currentUser = u;
        console.log("Delete button clicked for User:", u);

        Swal.fire(
            {
                title: "Are you sure, you to delete this User?",
            /*    text: u.UserName,*/
                icon: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn btn-primary w-xs me-2 mt-2",
                cancelButtonClass: "btn btn-danger w-xs mt-2",
                confirmButtonText: "Yes, delete it!",
                buttonsStyling: !1,
                showCloseButton: !0
            }).then(function (t) {
                if (t.value) {
                    // call delete function
                    $scope.delete();
                }
            });

    };

    $scope.delete = function () {
        $scope.isProcessing = true;
        $http({
            method: "POST",
            url: "/api/User/Remove",
            data: $scope.currentUser,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                // Close the delete modal if necessary
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected User has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                getUserData();
            } else {
                Swal.fire(
                    {
                        title: "Failed to delete",
                        text: resp.Message,
                        icon: "warning",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
            }
        }).catch(function (error) {
            console.error("Error deleting data:", error);
        });
    };


    $scope.sort = function (key) {

        $scope.sortReverse = ($scope.sortKey == key) ? !$scope.sortReverse : $scope.sortReverse;
        $scope.isSortedAsc = $scope.sortReverse;
        $scope.sortKey = key;
    }

});






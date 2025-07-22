myApp.controller('dailyAttendanceController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.attendanceList = [];
    $scope.enrollmentList = [];
    $scope.leaveTypeList = [];
    $scope.isSortedAsc = true;
    $scope.CurrentAttendnnce = {};
    $scope.pageSize = 100;
    $scope.currentPage = 1;
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.loading = true;
    $scope.requestModel = {};
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {
        const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD       
        $scope.requestModel = {
            AttDate: today
        }
        getAllDailyAttendance();
        getAllEnrollments();
        getAllManualEntryReason();
    }
    
    function getAllDailyAttendance() {
    $scope.loading = true;
    $http({
        method: "POST",
        url: "/api/DailyAttendance/Get",
        data: $scope.requestModel
    }).then(function (response) {
        var resp = response.data;
        $scope.attendanceList = resp.Data;
        $scope.loading = false;
        if (resp.IsSuccess) {
         
            console.log("Filtered Today's attendanceList", $scope.attendanceList);
        }
    }, function (er) {
        alert("data not found", er);
    });
    };
    $scope.filterByDate = function () {
        if ($scope.selectedDate) {
            const date = new Date($scope.selectedDate);
            // Format date to YYYY-MM-DD in local time
            const formattedDate = date.getFullYear() + '-' +
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0');

            $scope.requestModel = {
                AttDate: formattedDate
            };

            getAllDailyAttendance();
        } else {
            alert("No date selected");
        }
    };

    $scope.showOnlyValid = false;

    $scope.enrollNameFilter = function (item) {
        if (!$scope.showOnlyValid) return true;

        if (!item.enrollmentModel || !item.enrollmentModel.EnrollName) {
            return false;
        }

        const name = item.enrollmentModel.EnrollName;
        return name.trim().toLowerCase() !== "null";
    };
    $scope.CurrentAttendnnce.AttDate = new Date();
    //save data 
    $scope.saveAttendance = function () {
        $scope.CurrentAttendnnce.Inout = 0;     
        if (!$scope.CurrentAttendnnce.AttDate) {
            alert("Please select a date");
            return;
        }

        const dt = new Date($scope.CurrentAttendnnce.AttDate);
        const pad = (n) => n.toString().padStart(2, '0');
        const formattedDate = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

        // Helper function to extract HH:mm from time
        function extractTimeString(timeVal) {
            if (!timeVal) return null;
            if (typeof timeVal === 'string') return timeVal;
            if (timeVal instanceof Date) {
                const h = timeVal.getHours().toString().padStart(2, '0');
                const m = timeVal.getMinutes().toString().padStart(2, '0');
                return `${h}:${m}`;
            }
            return null;
        }

        // Extract MarkInTime and MarkOutTime strings
        const markInTime = $scope.markInChecked ? extractTimeString($scope.CurrentAttendnnce.MarkIn) : null;
        const markOutTime = $scope.markOutChecked ? extractTimeString($scope.CurrentAttendnnce.MarkOut) : null;

        if (!markInTime && !markOutTime) {
            alert("Please enter a valid Mark In or Mark Out time.");
            return;
        }

        // Build date-time string WITHOUT timezone shift (local time)
        function buildDateTime(dateStr, timeStr) {
            if (!timeStr) return null;
            const fullStr = `${dateStr}T${timeStr}:00`;
            const dateObj = new Date(fullStr);

            if (isNaN(dateObj.getTime())) return null;

            // Format as yyyy-MM-ddTHH:mm:ss (local time, no timezone offset)
            return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
        }

        // Prepare model object to send to API
        const model = {
            EnrollNo: $scope.CurrentAttendnnce.EnrollNo || null,
            Inout: 0,
            DeviceIP: $scope.CurrentAttendnnce.DeviceIP || null,
            VerifyMode: $scope.CurrentAttendnnce.VerifyMode || null,          
            DeviceLocation: 'M',         
            MarkInTime: buildDateTime(formattedDate, markInTime),
            MarkOutTime: buildDateTime(formattedDate, markOutTime),
            Description: $scope.CurrentAttendnnce.Description || "",
            Status: $scope.CurrentAttendnnce.Status || "",
            EmpID: $scope.CurrentAttendnnce.EmpID || null
        };
        console.log("Sending model to API:", model);
        $scope.isProcessing = true;
        $timeout(function () {
            $http({
                method: "POST",
                url: "/api/DailyAttendance/ManualAttendance",
                data: model,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;

                if (resp.IsSuccess) {
                    $scope.attendanceList = resp.Data;
                    console.log("Daily Attendance List Updated:", $scope.attendanceList);

                    // Show success message
                    Swal.fire({
                        title: $scope.editMode ? "Daily Attendance Updated Successfully!" : "Daily Attendance Save Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: false,
                    });

                    // Refresh client list
                    getAllDailyAttendance();
                    $scope.CurrentAttendnnce = {};
                    $scope.selectedEmployee = null;
                    $scope.markInChecked = false;
                    $scope.markOutChecked = false;

                    // Close modal
                    $('#showenrollmentModal').modal('hide');
                } else {
                    console.error("Save operation failed:", resp);
                }

                $scope.isProcessing = false;
            }).catch(function (error) {
                console.error("Error during save operation:", error);
                $window.alert("An error occurred. Please try again.");
                $scope.isProcessing = false;
            });
        }, 500);
    };
    
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
                console.log("enrollmentList", $scope.enrollmentList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    };
    $scope.selectedEmployee = null;
    $scope.OnselectedEnrolement = function (selectedEmployee) {
        if (selectedEmployee) {
            // console.info(" $scope.selectedRole", $scope.selectedRole);
            $scope.CurrentAttendnnce = $scope.CurrentAttendnnce || {};
            $scope.CurrentAttendnnce = $scope.CurrentAttendnnce || {};// Ensure currentUser is initialized
            $scope.CurrentAttendnnce.EmpID = selectedEmployee.ID;   // Set the Role to the Name of the selectedRole
            $scope.CurrentAttendnnce.EnrollNo = selectedEmployee.EnrollNo;   // Set the Role to the Name of the selectedRole
            console.info("selected Current Attendnnce", $scope.CurrentAttendnnce.EmpID)
        } else {
            console.log("No role selected.");
        }
    };
    function getAllManualEntryReason() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/ManualEntryReason/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.leaveTypeList = resp.Data;
                console.log("enrollmentList", $scope.enrollmentList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    };

    $scope.getEdit = function (c) {
        $scope.CurrentAttendnnce = angular.copy(c);
        $scope.editMode = true;
    }

    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.CurrentEnrollment = {};
    }
    $scope.cancel = function () {
        $scope.editMode = false;
        $scope.CurrentAttendnnce = {};
        $scope.selectedEmployee = null;
    }

    $scope.getDelete = function (c) {
        $scope.CurrentAttendnnce = angular.copy(c);
        console.log("Delete button clicked for Daily Attendance:", c);
        Swal.fire(
            {
                title: "Are you sure, you to delete this Daily Attendance?",
                text: c.DeptName,
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

    //delete data 
    $scope.delete = function () {

        $scope.isProcessing = true;

        $http({
            method: "POST",
            url: "/api/DailyAttendance/Remove",
            data: $scope.CurrentAttendnnce,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                // Close the delete modal if necessary
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected Daily Attendance has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                getAllDailyAttendance();
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
            $scope.isProcessing = false;
        }).catch(function (error) {
            console.error("Error deleting data:", error);
            $scope.isProcessing = true;
        });
    };
    $scope.filterByCode = function (item) {
        if (!$scope.searchCode && $scope.searchCode !== 0) {
            return true; // show all if empty
        }

        // Convert both values to string and compare
        let code = (item.dailyAttendanceModel.EnrollNo || '').toString();
        let query = $scope.searchCode.toString(); // safe conversion, no toLowerCase needed for numbers

        return code.includes(query);
    };



    //sort table data
    $scope.sort = function (key) {
        $scope.sortReverse = ($scope.sortKey == key) ? !$scope.sortReverse : $scope.sortReverse;
        $scope.isSortedAsc = $scope.sortReverse;
        $scope.sortKey = key;
    }
});






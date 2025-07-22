myApp.controller('employeedetailController', function ($scope, $http, $window, $timeout) {
    $scope.employeeDetailList = [];
    $scope.enrolementList = [];
    $scope.filteredEnrolmentList = [];
    $scope.deptList = [];
    $scope.employeeDetailRequest = {};
    $scope.selectedDepartmentName = {};
    $scope.selectedEnrolement = {};
    $scope.isSortedAsc = true;
    $scope.pageSize = 31;
    $scope.currentPage = 1;
    $scope.isCardHidden = false;
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.attendanceFilter = "all"; // default selected
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {

        $scope.isProcessing = false;     
        getEnrollList();
        getSettings();
    }

    $scope.cancel = function () {
        // Clear the date input fields
        $scope.employeeDetailRequest = {
            DateFrom: null,
            DateTo: null
        };

        // Clear the table data
        $scope.employeeDetailList = [];
    };
    function getEnrollList() {
        $scope.loadingEmployees = true;
        $http({
            method: "POST",
            url: "/api/Enrollment/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.enrolementList = resp.Data;
                let originalList = resp.Data;

                // Filter out duplicate DeptNames

                originalList.forEach(function (item) {
                    if (!$scope.deptList.includes(item.DeptName)) {
                        $scope.deptList.push(item.DeptName);
                    }
                });

                $scope.selectedDepartmentName = "dept";
                $scope.selectedEnrolement = "emp";
            }
        }, function (er) {
            alert("data not found", er);
        });
    };
    $scope.filteredEnrolmentList = [];
    function getSettings() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/GeneralSetting/Get",
            data: null,
        }).then(function (response) {
            console.log("Response received: ", response);
            var resp = response.data;
            if (resp.IsSuccess) {
                var settings = resp.Data;
                $scope.generalSetting = settings[0];


            } else {
                window.alert(resp.Message);
            }

            $scope.isLoading = false;
        }).catch(function (error) {
            window.alert(error);
            $scope.isLoading = false;
        });
    }
    $scope.onDepartmentChange = function () {

        if ($scope.selectedDepartmentName != "All") {
            $scope.filteredEnrolmentList = $scope.enrolementList.filter(function (item) {
                return item.DeptName === $scope.selectedDepartmentName;
            });
            if ($scope.filteredEnrolmentList.length > 0) {
                $scope.selectedEnrolement = $scope.filteredEnrolmentList[0].EnrollNo;
            } else {
                $scope.selectedEnrolement = '';
            }
        }
    };
    $scope.preview = function () {
        if (!$scope.selectedDepartmentName || $scope.selectedDepartmentName === "All" ||
            !$scope.selectedEnrolement || $scope.selectedEnrolement === "All") {
            alert("Please select both a Department and an Employee.");
            return; // Stop execution
        }

        console.log("Request:", $scope.attendanceRequest);
        if ($scope.selectedEnrolement == "All") {
            $scope.employeeDetailRequest.EnrollNo = 0;
        } else {

            if ($scope.selectedEnrolement) {
                $scope.employeeDetailRequest.EnrollNo = $scope.selectedEnrolement;
            }
        }


        if ($scope.selectedDepartmentName) {
            $scope.employeeDetailRequest.DeptName = $scope.selectedDepartmentName;
        }
        console.log("Request:", $scope.employeeDetailRequest);
        $scope.isCardHidden = true;
        $scope.isLoading = true;
        $scope.isProcessing = true;
        $http({
            method: "POST",
            url: "/api/DailyAttendance/GetEmployeesWiseDetail",
            data: $scope.employeeDetailRequest
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.employeeDetailList = resp.Data;
                console.log("employeeDetailList", $scope.employeeDetailList);
                localStorage.setItem("employeeDetailBackupList", JSON.stringify($scope.employeeDetailList));
            }
            $scope.isProcessing = false;
        }, function (er) {
            alert("data not found", er);
        }).catch(function (error) {
            $scope.isLoading = false;
            $scope.isProcessing = false;
            console.error("Error fetching attendance data", error);
            alert("Unable to fetch data. Please try again later.");
        });
    };


    $scope.filterAttendance = function () {
        var backupList = localStorage.getItem("employeeDetailBackupList");
        if (!backupList) {
            alert("No backup data found. Please preview attendance first.");
            return;
        }

        var allData = JSON.parse(backupList);

        switch ($scope.attendanceFilter) {
            case "present":
                $scope.employeeDetailList = allData.filter(emp => emp.Status === "Present");
                break;
            case "absent":
                $scope.employeeDetailList = allData.filter(emp => emp.Status === "Absent");
                break;
            case "late":
                $scope.employeeDetailList = allData.filter(emp => emp.Status === "Late-Arrival");
                break;
            case "all":
            default:
                $scope.employeeDetailList = allData; // Show all
                break;
        }
    };

    $scope.setEndDate = function () {
        if ($scope.attendanceRequest.DateFrom) {
            var fromDate = new Date($scope.attendanceRequest.DateFrom);
            fromDate.setDate(fromDate.getDate() + 30);
            $scope.attendanceRequest.DateTo = fromDate.toISOString().split('T')[0]; // Format as yyyy-MM-dd
        }
    };
    $scope.cancel = function () {
        $scope.isCardHidden = false;
        $scope.employeeDetailRequest = {};
        $scope.employeeDetailList = [];
    }

    $scope.export = function () {
        if (!$scope.employeeDetailList || $scope.employeeDetailList.length === 0) {
            alert("No data to export.");
            return;
        }

        // Helper functions to format date and time
        function formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0]; // yyyy-MM-dd
        }

        function formatDay(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return ("0" + date.getDate()).slice(-2); // dd
        }

        function formatTime(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // shortTime format
        }

        // Map the table data for export
        var exportData = $scope.employeeDetailList.map(item => ({
            'Date': formatDate(item.AttDate),
            'Day': formatDay(item.AttDate),
            'ClockIn': formatTime(item.ClockIn),
            'ClockOut': formatTime(item.ClockOut),
            'Hours Worked': Math.round(item.HrsWorked || 0),
            'Late Minutes': Math.round(item.LateMins || 0),
            'Early Minutes': Math.round(item.EarlyMins || 0),
            'Over Time Minutes': Math.round(item.OvertimeMins || 0)
        }));

        // Create worksheet from the mapped data
        var worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create a new workbook and append the worksheet
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Summary");

        // Export the workbook as an Excel file
        XLSX.writeFile(workbook, "EmployeeAttendanceReport.xlsx");
    };





    $scope.print = function () {
        var { jsPDF } = window.jspdf;
        var doc = new jsPDF();

        if (!$scope.employeeDetailList || $scope.employeeDetailList.length === 0) {
            alert("No attendance records to print.");
            return;
        }

        var emp = $scope.employeeDetailList[0] || {};

        doc.setFontSize(20);
        doc.text($scope.generalSetting.CoyName, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

        // Set title
        var title = 'Employee Attendance Detail Report';
        doc.setFontSize(16);
        var titleX = doc.internal.pageSize.getWidth() / 2;
        var titleY = 22;
        doc.text(title, titleX, titleY, { align: 'center' });
        doc.line(titleX - doc.getTextWidth(title) / 2, 24, titleX + doc.getTextWidth(title) / 2, 24);

        // Employee Info Labels
        doc.setFontSize(12);
        let infoY = 30;
        doc.text(`Enroll No: ${emp.EnrollNo || ''}`, 14, infoY);
        doc.text(`Enroll Name: ${emp.EnrollName || ''}`, 105, infoY);
        doc.text(`Department Name: ${emp.DepartmentName || ''}`, 14, infoY + 7);
        doc.text(`Shift Name: ${emp.ShiftName || ''}`, 105, infoY + 7);

        // Table headers
        var headers = [[
            'Date', 'Day', 'ClockIn', 'ClockOut', 'Hours Worked',
            'Late Minutes', 'Early Minutes', 'Over Time Minutes'
        ]];

        // Table body
        var data = ($scope.employeeDetailList || []).map(function (item) {
            var date = new Date(item.AttDate);
            var day = date.toLocaleDateString('en-US', { weekday: 'short' });

            return [
                item.AttDate ? item.AttDate.split('T')[0] : '',
                day,
                item.ClockIn ? new Date(item.ClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                item.ClockOut ? new Date(item.ClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                item.HrsWorked || '00:00:00',
                item.LateMins != null ? item.LateMins.toFixed(0) : '0',
                item.EarlyMins != null ? item.EarlyMins.toFixed(0) : '0',
                item.OvertimeMins != null ? item.OvertimeMins.toFixed(0) : '0'
             
            ];
        });

        // Generate the PDF table
        doc.autoTable({
            head: headers,
            body: data,
            startY: 50,
            theme: 'grid',
            styles: {
                fontSize: 9,
                halign: 'center',
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.2
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            margin: { left: 10, right: 10 },
            pageBreak: 'auto'
        });

        // Add signature lines
        var signatureY = doc.lastAutoTable.finalY + 20;
        if (signatureY + 30 > doc.internal.pageSize.height) {
            doc.addPage();
            signatureY = 10;
        }

        doc.setFontSize(12);
        doc.line(14, signatureY, 60, signatureY);    // Created by
        doc.line(80, signatureY, 130, signatureY);   // Checked by
        doc.line(150, signatureY, 185, signatureY);  // Approved by

        doc.text('Created by:', 14 + (60 - 14 - doc.getTextWidth('Created by:')) / 2, signatureY + 5);
        doc.text('Checked by:', 80 + (130 - 80 - doc.getTextWidth('Checked by:')) / 2, signatureY + 5);
        doc.text('Approved by:', 150 + (185 - 150 - doc.getTextWidth('Approved by:')) / 2, signatureY + 5);

        // Save the PDF
        /* doc.save('AttendanceDetailVoucher.pdf');*/
        var pdfBlob = doc.output('blob');
        var blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
    };




    //save data 
    $scope.saveAttendance = function () {
        var existingClient = $scope.employeeDetailList.find(function (enrollment) {
            return enrollment.DeviceIP === $scope.CurrentAttendnnce.DeviceIP && enrollment.ID !== $scope.CurrentAttendnnce.ID; // Exclude current client
        });

        if (existingClient) {
            // Name already exists
            Swal.fire({
                text: 'Daily Attendance with the same Daily Attendance already exists',
                timer: 2000
            }).then(function () {
                const modal = bootstrap.Modal.getInstance(document.getElementById('showenrollmentModal'));
                modal.hide();
            });

            return;
        }

        // Proceed with save logic
        $scope.isProcessing = true;
        $timeout(function () {
            $http({
                method: "POST",
                url: "/api/DailyAttendance/Save",
                data: $scope.CurrentAttendnnce,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;

                if (resp.IsSuccess) {
                    $scope.employeeDetailList = resp.Data;
                    console.log("Daily Attendance List Updated:", $scope.employeeDetailList);

                    // Show success message
                    Swal.fire({
                        title: $scope.editMode ? "Daily Attendance Updated Successfully!" : "Daily Attendance Save Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: false,
                    });

                    // Refresh client list
                    getAllDailyAttendance();

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




    $scope.getEdit = function (c) {
        $scope.CurrentAttendnnce = angular.copy(c);
        $scope.editMode = true;
    }

    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.CurrentEnrollment = {};
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

    //sort table data
    $scope.sort = function (key) {
        $scope.sortReverse = ($scope.sortKey == key) ? !$scope.sortReverse : $scope.sortReverse;
        $scope.isSortedAsc = $scope.sortReverse;
        $scope.sortKey = key;
    }
});






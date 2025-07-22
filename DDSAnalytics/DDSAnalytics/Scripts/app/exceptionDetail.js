myApp.controller('exceptionDetailController', function ($scope, $http, $window, $timeout) {
    $scope.exceptionDetailList = [];
    $scope.enrolementList = [];
    $scope.filteredEnrolmentList = [];
    $scope.deptList = [];
    $scope.exceptionRequest = {};
    $scope.isSortedAsc = true;
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.selectedEmployee = {};
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.isCardHidden = false; // Hide the card body
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {

        $scope.isProcessing = false;
        getEnrollList();
        getSettings();
       // getEmployeesList();

    }

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

                $scope.selectedDepartmentName = "All";
                $scope.selectedEnrolement = "All";
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
        if ($scope.selectedEnrolement === "All" && !$scope.selectedDepartmentName) {
            alert("Please select department and employee.");
            return; // Stop execution
        }
        if ($scope.selectedEnrolement == "All") {
            $scope.attendanceRequest.EnrollNo = 0;
        } else {

            if ($scope.selectedEnrolement) {
                $scope.attendanceRequest.EnrollNo = $scope.selectedEnrolement;
            }
        }


        if ($scope.selectedDepartmentName) {
            $scope.attendanceRequest.DeptName = $scope.selectedDepartmentName;
        }
        console.log("Request:", $scope.attendanceRequest);
       
        $scope.isCardHidden = true;
        $scope.isLoading = true;
        $scope.isProcessing = true;

        $http({
            method: "POST",
            url: "/api/DailyAttendance/GetExceptionWiseDetail",
            data: $scope.attendanceRequest
        }).then(function (response) {
            console.log("API response:", response);
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.exceptionDetailList = resp.Data;
                console.log("attendance List", $scope.exceptionDetailList);
            }
            $scope.isProcessing = false;
        }, function (er) {
            console.error("API error:", er);
            $scope.isLoading = false;
            $scope.isProcessing = false;
        });
    };

    $scope.setEndDate = function () {
        if ($scope.attendanceRequest.DateFrom) {
            // Add 30 days to DateFrom
            var fromDate = new Date($scope.attendanceRequest.DateFrom);
            fromDate.setDate(fromDate.getDate() + 30);
            $scope.attendanceRequest.DateTo = fromDate.toISOString().split('T')[0]; // Format as yyyy-MM-dd
        }
    };
   

    $scope.cancel = function () {
        $scope.isCardHidden = false; // Hide the card body
        $scope.exceptionRequest = {};
        $scope.exceptionDetailList = [];
    }

    $scope.export = function () {
        if (!$scope.exceptionDetailList || $scope.exceptionDetailList.length === 0) {
            alert("No data to export.");
            return;
        }

        var exportData = $scope.exceptionDetailList.map(item => ({
            'Code': item.EnrollNo || '',
            'Name': item.EnrollName || '',
            'Department': item.DepartmentName || '',
            'Date': item.AttDate || '',
            'Clock IN': item.ClockIn || '',
            'Clock OUT': item.ClockOut || ''
        }));

        var worksheet = XLSX.utils.json_to_sheet(exportData);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        XLSX.writeFile(workbook, "AttendanceDetails.xlsx");
    };

    $scope.print = function () {
        var { jsPDF } = window.jspdf;

        if (!$scope.exceptionDetailList || $scope.exceptionDetailList.length === 0) {
            alert("No data to print.");
            return;
        }

        var doc = new jsPDF('landscape', 'mm', 'a4');

        // Company Name
        doc.setFontSize(20);
        doc.text($scope.generalSetting.CoyName, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

        // Report Title
        var title = 'Exception Attendance Report';
        doc.setFontSize(16);
        var titleX = doc.internal.pageSize.getWidth() / 2;
        var titleY = 22;
        doc.text(title, titleX, titleY, { align: 'center' });
        doc.line(titleX - doc.getTextWidth(title) / 2, 24, titleX + doc.getTextWidth(title) / 2, 24);

        // Horizontal info row: Department Name | Date From | Date To
        doc.setFontSize(12);
        var infoY = 30;

        function formatDate(d) {
            if (!d) return '';
            let date = new Date(d);
            return date.toISOString().split('T')[0];
        }

        doc.text(`Department Name: ${$scope.attendanceRequest.DeptName || 'All'}`, 14, infoY);
        doc.text(`Date From: ${formatDate($scope.attendanceRequest.DateFrom)}`, 120, infoY);
        doc.text(`Date To: ${formatDate($scope.attendanceRequest.DateTo)}`, 220, infoY);

        // Table headers
        var headers = [['Code', 'Name', 'Department', 'Date', 'Clock IN', 'Clock OUT']];

        // Table body data
        var data = $scope.exceptionDetailList.map(item => [
            item.EnrollNo || '',
            item.EnrollName || '',
            item.DepartmentName || '',
            item.AttDate ? new Date(item.AttDate).toISOString().split('T')[0] : '',
            item.ClockIn || '',
            item.ClockOut || ''
        ]);

        // Draw table
        doc.autoTable({
            head: headers,
            body: data,
            startY: infoY + 10,
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

        // Signature lines
        var signatureY = doc.lastAutoTable.finalY + 20;
        if (signatureY + 30 > doc.internal.pageSize.height) {
            doc.addPage();
            signatureY = 10;
        }

        doc.setFontSize(12);
        doc.line(14, signatureY, 60, signatureY);    // Created by
        doc.line(80, signatureY, 130, signatureY);   // Checked by
        doc.line(150, signatureY, 200, signatureY);  // Approved by

        doc.text('Created by:', 14 + (60 - 14 - doc.getTextWidth('Created by:')) / 2, signatureY + 5);
        doc.text('Checked by:', 80 + (130 - 80 - doc.getTextWidth('Checked by:')) / 2, signatureY + 5);
        doc.text('Approved by:', 150 + (200 - 150 - doc.getTextWidth('Approved by:')) / 2, signatureY + 5);

        // Save PDF
        /* doc.save('AttendanceExceptionReport.pdf');*/
        var pdfBlob = doc.output('blob');
        var blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
    };


    //save data 
    $scope.saveAttendance = function () {
        var existingClient = $scope.exceptionDetailList.find(function (enrollment) {
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
                    $scope.exceptionDetailList = resp.Data;
                    console.log("Daily Attendance List Updated:", $scope.exceptionDetailList);

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






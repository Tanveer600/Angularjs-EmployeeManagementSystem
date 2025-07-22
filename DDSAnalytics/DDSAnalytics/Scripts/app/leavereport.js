myApp.controller('leaveController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.enrollmentList = [];
    $scope.leaveReportList = [];
    $scope.leaveReportListData = [];
    $scope.leaveReport = [];
    $scope.LeaveRequest = {};
    $scope.levaeList = [];
    $scope.leaveTypeList = [];
    $scope.generalSetting = [];
    $scope.isSortedAsc = true;
    $scope.isCardHidden = false;
    $scope.currentLeave = { leave: {}};
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {
        getAllEnrollments();
        getAllLeaveReport();
        getSettings();
        getAllLeaveTypeList();
    }
    $scope.selectedLeaveType = {};
    $scope.OnselectedLeaveType = function (selectedLeaveType) {
        if (selectedLeaveType) {
            $scope.selectedLeaveType = selectedLeaveType;
            // console.info(" $scope.selectedRole", $scope.selectedRole);
            $scope.currentLeave = $scope.currentLeave || {};
            $scope.currentLeave.leave = $scope.currentLeave.leave || {};
            $scope.currentLeave.leave.LeaveTypeID = selectedLeaveType.ID;
            $scope.currentLeave.LeaveModel = selectedLeaveType;

            console.info("Selected Leave Type : ", $scope.selectedLeaveType)
            console.info("Selected Employee : ", $scope.selectedEmployee);

            // call api to get all leaves availed by the selected person
            $scope.LeaveRequest = {
                EnrollNo: $scope.selectedEmployee.EnrollNo,
                LeaveTypeID: $scope.selectedLeaveType.ID
            };

            $scope.isLoading = true;
            $http({
                method: "POST",
                url: "/api/LeaveReport/GetYearlyLeave",
                data: $scope.LeaveRequest
            }).then(function (response) {
                var resp = response.data;

                $scope.leaveReportListData = resp.Data; // ✅ FIXED here

                console.info("Year Leaves Response:", $scope.leaveReportListData);

                var total = 0;
                for (var i = 0; i < $scope.leaveReportListData.length; i++) {
                    total += $scope.leaveReportListData[i].TotalDays || 0;
                }

                $scope.TotalDays = total; // ✅ Correctly set
            }, function (er) {
                alert("data not found", er);
            });

        } else {
            console.log("No role selected.");
        }
    };
    function getAllLeaveReport() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/LeaveReport/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.levaeList = resp.Data;
                console.log("levaeList", $scope.levaeList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
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
                console.log("enrollmentList", $scope.enrollmentList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    };
    function getAllLeaveTypeList() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/LeaveType/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.leaveTypeList = resp.Data;
                console.log("leaveTypeList", $scope.leaveTypeList);
            }
        }, function (er) {
            alert("data not found", er);
        });
    };


    $scope.selectedLeaveType = {};
    $scope.OnselectedLeaveType = function (selectedLeaveType) {
        if (selectedLeaveType) {
            // console.info(" $scope.selectedRole", $scope.selectedRole);
            $scope.currentLeave = $scope.currentLeave || {};
            $scope.currentLeave.leave = $scope.currentLeave.leave || {};
            $scope.currentLeave.leave.LeaveTypeID = selectedLeaveType.ID;   
            $scope.currentLeave.LeaveModel = selectedLeaveType;

            console.info("Selected Leave Type : ", $scope.selectedLeaveType)
            console.info("Selected Employee : ", $scope.selectedEmployee);

            // call api to get all leaves availed by the selected person
            $scope.LeaveRequest = {
                EnrollNo: $scope.selectedEmployee.EnrollNo,
                LeaveTypeID: $scope.selectedLeaveType.ID
            };

            $scope.isLoading = true;
            $http({
                method: "POST",
                url: "/api/LeaveReport/GetYearlyLeave",
                data: $scope.LeaveRequest
            }).then(function (response) {
                var resp = response.data;

                $scope.leaveReportListData = resp.Data; // ✅ FIXED here

                console.info("Year Leaves Response:", $scope.leaveReportListData);

                var total = 0;
                for (var i = 0; i < $scope.leaveReportListData.length; i++) {
                    total += $scope.leaveReportListData[i].TotalDays || 0;
                }

                $scope.TotalDays = total; // ✅ Correctly set
            }, function (er) {
                alert("data not found", er);
            });

        } else {
            console.log("No role selected.");
        }
    };


    $scope.selectedEmployee = {};
    $scope.OnselectedEnrolement = function (selectedEmployee) {
        if (selectedEmployee) {
            // console.info(" $scope.selectedRole", $scope.selectedRole);
            $scope.currentLeave = $scope.currentLeave || {};
            $scope.currentLeave.leave = $scope.currentLeave.leave || {};// Ensure currentUser is initialized
            $scope.currentLeave.leave.EmpID = selectedEmployee.ID;   // Set the Role to the Name of the selectedRole
            $scope.currentLeave.enrollment = selectedEmployee;
            console.info("selected Employee", $scope.currentLeave.leave.EmpID)
        } else {
            console.log("No role selected.");
        }
    };
    function formatDateLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    function getDatesInRange(start, end) {
        const dateArray = [];
        let current = new Date(start);
        const last = new Date(end);

        while (current <= last) {
            dateArray.push(formatDateLocal(new Date(current)));
            current.setDate(current.getDate() + 1);
        }
        return dateArray;
    }
    //save data 
    $scope.save = function () {  

        // Format StartDate and EndDate to yyyy-MM-dd
        if ($scope.currentLeave.leave.StartDate instanceof Date) {
            $scope.currentLeave.leave.StartDate = formatDateLocal($scope.currentLeave.leave.StartDate);
        }

        if ($scope.currentLeave.leave.EndDate instanceof Date) {
            $scope.currentLeave.leave.EndDate = formatDateLocal($scope.currentLeave.leave.EndDate);
        }

        var selectedEnrollNo = $scope.selectedEmployee?.EnrollNo;
        var selectedStartDate = $scope.currentLeave.leave.StartDate;
        var selectedEndDate = $scope.currentLeave.leave.EndDate;

        if (!selectedStartDate || !selectedEndDate) {
            Swal.fire({
                icon: "warning",
                title: "Missing Date",
                text: "Please select both Start Date and End Date.",
                confirmButtonClass: "btn btn-primary w-xs mt-2",
                buttonsStyling: false,
            });
            return;
        }

        var selectedDates = getDatesInRange(selectedStartDate, selectedEndDate);

        var isDuplicate = $scope.levaeList.some(function (item, index) {
            if (!item?.enrollment?.EnrollNo || !item?.leave?.StartDate) return false;

            var existingDate = formatDateLocal(new Date(item.leave.StartDate));

            return item.enrollment.EnrollNo === selectedEnrollNo &&
                selectedDates.includes(existingDate);
        });

        if (isDuplicate) {
            Swal.fire({
                icon: "warning",
                title: "Duplicate Entry",
                text: "This employee already has leave on a date between selected Start and End Date.",
                confirmButtonClass: "btn btn-primary w-xs mt-2",
                buttonsStyling: false,
            });
            return;
        }
        // Proceed with save logic
        $scope.isProcessing = true;
        $timeout(function () {
            $http({
                method: "POST",
                url: "/api/LeaveReport/Save",
                data: $scope.currentLeave,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;

                if (resp.IsSuccess) {
                    $scope.levaeList = resp.Data;
                    console.log("levae List  Updated:", $scope.levaeList);

                    // Show success message
                    Swal.fire({
                        title: $scope.editMode ? "Leave Report Updated Successfully!" : "Leave Report Save Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: false,
                    });

                    // Refresh client list
                    getAllLeaveReport();

                    // Close modal
                    $('#showLeaveModal').modal('hide');
                    $scope.currentLeave = {};
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

    $scope.setEndDate = function () {
        if ($scope.LeaveRequest.DateFrom) {
            var fromDate = new Date($scope.LeaveRequest.DateFrom);
            fromDate.setDate(fromDate.getDate() + 30);
            $scope.LeaveRequest.DateTo = fromDate.toISOString().split('T')[0]; // Format as yyyy-MM-dd
        }
    };
    $scope.resetLeaveForm = function () {
        $scope.selectedEmployee = null;
        $scope.selectedLeaveType = null;
        $scope.TotalDays = 0;

        $scope.currentLeave = {
            leave: {
                StartDate: null,
                EndDate: null,
                Description: '',
                LeaveTypeID: null
            }
        };

        $scope.leaveReportListData = [];
        $scope.LeaveRequest = {};
    };

    $scope.filterByDate = function () {
        if (!$scope.LeaveRequest.DateFrom || !$scope.LeaveRequest.DateTo) {
            Swal.fire({
                title: "Missing Date Range!",
                text: "Please select both start and end dates.",
                icon: "warning",
                confirmButtonClass: "btn btn-primary w-xs mt-2",
                buttonsStyling: false,
            });
            return;
        }

        var requestData = {
            DateFrom: $scope.LeaveRequest.DateFrom,
            DateTo: $scope.LeaveRequest.DateTo,          
        };
        $scope.isCardHidden = true;
        $scope.isLoading = true;
        console.info("requestData", requestData);
        $http({
            method: "POST",
            url: "/api/LeaveReport/GetLeaveDetail", // your new method name
            data: requestData
        }).then(function (response) {
            $scope.isLoading = false;
            var resp = response.data;
            if (resp.IsSuccess) {
                $scope.leaveReportList = resp.Data;
                console.log("Filtered leave list", $scope.leaveReportList);
            } else {
                Swal.fire("Error", resp.Message, "error");
            }
        }, function (error) {
            $scope.isLoading = false;
            console.error("Error filtering leave data:", error);
            Swal.fire("Error", "Something went wrong!", "error");
        });
    };


    $scope.getEdit = function (u) {
        $scope.currentLeave = angular.copy(u);
        $scope.selectedEmployee = $scope.enrollmentList.find(role => role.ID === u.leave.EmpID);
        console.info("$scope.selectedEmployee", $scope.selectedEmployee)
        $scope.editMode = true;
    }

    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.currentLeave = {};
        $scope.selectedEmployee = null; // This clears the dropdown
    }


    $scope.getDelete = function (u) {
        $scope.currentLeave = angular.copy(u);
        console.log("Delete button clicked for Leave Report:", u);
        Swal.fire(
            {
                title: "Are you sure, you to delete this Enrollment?",
                text: u.LeaveType,
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
            url: "/api/LeaveReport/Remove",
            data: $scope.currentLeave,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                // Close the delete modal if necessary
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected Leave Report has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                getAllLeaveReport();
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
    $scope.cancel = function () {  
        $scope.isCardHidden = false;
        // Clear the table data
        $scope.leaveReportList = [];
    };
    $scope.exportToExcel = function () {
        if (!$scope.leaveReportList || $scope.leaveReportList.length === 0) {
            alert("No data to export!");
            return;
        }

        // Prepare data array for Excel
        var exportData = $scope.leaveReportList.map(function (item) {
            return {
                "Leave Type": item.LeaveModel.LeaveTypeName,
                "Enroll No": item.enrollment ? item.enrollment.EnrollNo : '',
                "Description": item.leave.Description,
                "Start Date": item.leave.StartDate ? new Date(item.leave.StartDate).toLocaleDateString() : '',
                "End Date": item.leave.EndDate ? new Date(item.leave.EndDate).toLocaleDateString() : ''
            };
        });

        // Create worksheet from JSON
        var worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create new workbook and append the worksheet
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveReport");

        // Export to file (you can customize filename)
        XLSX.writeFile(workbook, "LeaveReport.xlsx");
    };
    $scope.viewLeaves = function () {
        if (!$scope.selectedEmployee || !$scope.selectedLeaveType) {
            alert("Please select both employee and leave type.");
            return;
        }

        if (!$scope.leaveReportListData || $scope.leaveReportListData.length === 0) {
            alert("No data found for selected leave type.");
            return;
        }

        // Use already-loaded data (do NOT call API again)
        $scope.leaveReport = $scope.leaveReportListData;
        // Optionally generate PDF
        generateLeaveReportPDF();
    };



    function generateLeaveReportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');

        if (!$scope.leaveReport || $scope.leaveReport.length === 0) {
            alert("No data to print.");
            return;
        }

        const emp = $scope.selectedEmployee || {};
        const data = $scope.leaveReport;

        // Company Header
        doc.setFontSize(20);
        doc.text($scope.generalSetting?.CoyName || 'Company Name', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

        // Report Title
        const title = 'Employee Leave Detail Report';
        doc.setFontSize(16);
        const titleX = doc.internal.pageSize.getWidth() / 2;
        doc.text(title, titleX, 22, { align: 'center' });
        doc.line(titleX - doc.getTextWidth(title) / 2, 24, titleX + doc.getTextWidth(title) / 2, 24);

        // Report Info Row (Same line with proper spacing)
        doc.setFontSize(12);
        let infoY = 30;

        const empName = emp.EnrollName || '';
        const empNo = emp.EnrollNo || '';
        const fromDate = emp.FromDate || ($scope.leaveReport[0]?.FromDate || '');
        const toDate = emp.DateTo || ($scope.leaveReport[0]?.ToDate || '');

        // Show in one line with good spacing using fixed X positions
        doc.text(`Employee: ${empName} (${empNo})`, 14, infoY);
        doc.text(`From Date: ${fromDate}`, 180, infoY);
        doc.text(`To Date: ${toDate}`, 250, infoY);

        // Table Headers
        const headers = [['Leave Type', 'Start Date', 'End Date', 'Description']];

        // Table Rows
        const rows = data.map(d => [
            d.LeaveModel?.LeaveTypeName || d.LeaveTypeName || '',
            d.leave?.StartDate ? new Date(d.leave.StartDate).toLocaleDateString() : d.StartDate ? new Date(d.StartDate).toLocaleDateString() : '',
            d.leave?.EndDate ? new Date(d.leave.EndDate).toLocaleDateString() : d.EndDate ? new Date(d.EndDate).toLocaleDateString() : '',
            d.leave?.Description || d.Description || ''
        ]);

        // Table
        doc.autoTable({
            head: headers,
            body: rows,
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
        var pdfBlob = doc.output('blob');
        var blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
        // Save PDF
       /* doc.save('LeaveReportVoucher.pdf');*/
    }







    $scope.print = function () {
        var { jsPDF } = window.jspdf;

        if (!$scope.levaeList || $scope.levaeList.length === 0) {
            alert("No data to print.");
            return;
        }

        var doc = new jsPDF('landscape', 'mm', 'a4');

        // Company Name
        doc.setFontSize(20);
        doc.text($scope.generalSetting.CoyName, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

        // Report Title
        var title = 'Leave Report';
        doc.setFontSize(16);
        var titleX = doc.internal.pageSize.getWidth() / 2;
        var titleY = 22;
        doc.text(title, titleX, titleY, { align: 'center' });
        doc.line(titleX - doc.getTextWidth(title) / 2, 24, titleX + doc.getTextWidth(title) / 2, 24);

        // Info Row (Optional: you can customize it)
        doc.setFontSize(12);
        var infoY = 30;
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, infoY);

        // Table headers
        var headers = [['Leave Type', 'Enroll No', 'Description', 'Start Date', 'End Date']];

        // Table body
        var data = $scope.levaeList.map(u => [
            u.LeaveModel?.LeaveTypeName || '',
            u.enrollment?.EnrollNo || '',
            u.leave?.Description || '',
            u.leave?.StartDate ? new Date(u.leave.StartDate).toLocaleDateString() : '',
            u.leave?.EndDate ? new Date(u.leave.EndDate).toLocaleDateString() : ''
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
        var pdfBlob = doc.output('blob');
        var blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
       /* doc.save('LeaveReport.pdf');*/
    };


    //sort table data
    $scope.sort = function (key) {
        $scope.sortReverse = ($scope.sortKey == key) ? !$scope.sortReverse : $scope.sortReverse;
        $scope.isSortedAsc = $scope.sortReverse;
        $scope.sortKey = key;
    }
});







   









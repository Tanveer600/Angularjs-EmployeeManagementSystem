
myApp.controller('attendanceSummaryController', function ($scope, $filter, $http, $window, $timeout) {
    $scope.attendanceSummaryList = [];
    $scope.enrolementList = [];
    $scope.selectedMonth = 'present';
    $scope.attendanceRequest = {};
    $scope.generalSetting = {};
    $scope.isSortedAsc = true;
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.selectedEnrolement = {};
    $scope.deptList = [];
    $scope.selectedDepartmentName = {};
    $scope.isCardHidden = false;
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.today = new Date();
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {

        $scope.isProcessing = false;
        // load all employees data in enrollment
        getEnrollList();
        getSettings();

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

       

        if ($scope.selectedEnrolement == "All") {
            $scope.attendanceRequest.EnrollNo = 0;
        } else {

            if ($scope.selectedEnrolement) {
                $scope.attendanceRequest.EnrollNo = $scope.selectedEnrolement;
                $scope.attendanceRequest.EnrollName = $scope.selectedEnrolement;
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
            url: "/api/DailyAttendance/GetMonthlyAttendance",
            data: $scope.attendanceRequest
        }).then(function (response) {
            console.log("API response:", response);
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.attendanceSummaryList = resp.Data;
                console.log("attendance List", $scope.attendanceSummaryList);
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
        $scope.isCardHidden = false;
        $scope.attendanceRequest = {};
        $scope.attendanceSummaryList = [];
    }
    //save data 
    $scope.saveAttendance = function () {
        var existingClient = $scope.attendanceList.find(function (enrollment) {
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
    $scope.export = function () {
        if (!$scope.attendanceSummaryList || $scope.attendanceSummaryList.length === 0) {
            alert("No data to export.");
            return;
        }

        // Create worksheet from attendance list
        var exportData = $scope.attendanceSummaryList.map(item => ({
            'Code': item.Code || '',
            'Name': item.Name || '',
            'Monthly Days': item.MonthlyDays || 0,
            'Working Days': item.WorkingDays || 0,
            'Absent Days': item.AbsentDays || 0,
            'Holiday Present Days': item.PresentDays || 0,
            'InOut Error In Days': item.InOutErrorDays || 0,
            'Late Coming': item.LateMinutes || 0,
            'Early Going': item.EarlyMinutes || 0,
            'Total Late': item.TotalLateMinutes?.toFixed(2) || '0.00',
            'Over Time': item.OvertimeMinutes?.toFixed(2) || '0.00',
            'Auto Adjustment': item.AutoAdjustment?.toFixed(2) || '0.00',
            'Over Time In Hours': item.OvertimeInHours?.toFixed(2) || '0.00'
        }));

        var worksheet = XLSX.utils.json_to_sheet(exportData);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Summary");

        // Export to file
        XLSX.writeFile(workbook, "AttendanceSummary.xlsx");
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
    $scope.print = function () {
        var { jsPDF } = window.jspdf;

        // Create a new jsPDF instance with landscape orientation and A4 size (which has a wider width in landscape)
        var doc = new jsPDF('landscape', 'mm', 'a4');

        // Set company name header
        doc.setFontSize(20);
        doc.text($scope.generalSetting.CoyName, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

        // Set title
        var title = 'Attendance Summary Report';
        doc.setFontSize(16);
        var titleX = doc.internal.pageSize.getWidth() / 2;
        var titleY = 22;
        doc.text(title, titleX, titleY, { align: 'center' });
        doc.line(titleX - doc.getTextWidth(title) / 2, 24, titleX + doc.getTextWidth(title) / 2, 24);
        // Set font size
        doc.setFontSize(12);

        // Values
        var deptName = $scope.attendanceRequest.DeptName || '';
        var enrollName = $scope.attendanceSummaryList[0]?.Name || '';
        var dateFrom = $filter('date')($scope.attendanceRequest.DateFrom, 'yyyy-MM-dd');
        var dateTo = $filter('date')($scope.attendanceRequest.DateTo, 'yyyy-MM-dd');

        // Define Y position
        var infoY = 30;

        // Left side text
        doc.text(`Department: ${deptName}`, 14, infoY);
        doc.text(`Date From: ${dateFrom}`, 14, infoY + 7);

        // Right side text (aligned right using page width)
        var pageWidth = doc.internal.pageSize.getWidth();
        doc.text(`Enrollment Name: ${enrollName}`, pageWidth - 14 - doc.getTextWidth(`Enrollment Name: ${enrollName}`), infoY);
        doc.text(`Date To: ${dateTo}`, pageWidth - 14 - doc.getTextWidth(`Date To: ${dateTo}`), infoY + 7);
        // Table headers based on your provided table
        var headers = [[
            'Code', 'Name', 'Monthly Days', 'Working Days', 'Absent Days',
            'Holiday Present Days', 'InOut Error In Days', 'Late Coming', 'Early Going',
            'Total Late', 'Over Time', 'Auto Adjustment', 'Over Time In Hours'
        ]];

        // Optional: Filter selected rows if needed (you can remove the filter if not using checkboxes)
        var selectedData = $scope.attendanceSummaryList.filter(a => a.selected || true); // Keep all if no checkbox

        if (selectedData.length === 0) {
            alert("No attendance records to print.");
            return;
        }

        // Format the table body
        var data = selectedData.map(function (item) {
            return [
                item.Code || '',
                item.Name || '',
                item.MonthlyDays || 0,
                item.WorkingDays || 0,
                item.AbsentDays || 0,
                item.PresentDays || 0,
                item.InOutErrorDays || 0,
                Math.round(item.LateMinutes) || 0,
                Math.round(item.EarlyMinutes) || 0,
                Math.round(item.TotalLateMinutes) || 0,
                Math.round(item.OvertimeMinutes) || 0,
                Math.round(item.AutoAdjustment) || 0,
                Math.round(item.OvertimeInHours) || 0
            ];
        });

        doc.autoTable({
            head: headers,
            body: data,
            startY: 40,
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

        // Add signature section
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

        // Save PDF
        /*doc.save('AttendanceSummaryVoucher.pdf');*/
        var pdfBlob = doc.output('blob');
        var blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
    };


    //sort table data
    $scope.sort = function (key) {
        $scope.sortReverse = ($scope.sortKey == key) ? !$scope.sortReverse : $scope.sortReverse;
        $scope.isSortedAsc = $scope.sortReverse;
        $scope.sortKey = key;
    }
});






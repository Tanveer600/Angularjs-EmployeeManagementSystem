myApp.controller('attendanceDetailsController', function ($scope, $http, $window, $timeout) {
    $scope.attendanceList = [];
    $scope.deptList = [];
    $scope.enrolementList = [];
    $scope.filteredEnrolmentList = [];
    $scope.attendanceRequest = {};
    $scope.isSortedAsc = true;
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.selectedEmployee = {};
    $scope.isProcessing = false;
    $scope.isCardHidden = false;
    $scope.isLoading = false;
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {

        $scope.isProcessing = false;
        getEmployeeList();
        getSettings();
        
    }
    function getEmployeeList() {
       
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
    };
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

    $scope.previewListBuuton = function () {


        $scope.attendanceRequest.DateTo = $scope.attendanceRequest.DateFrom;
        if ($scope.selectedDepartmentName) {
            $scope.attendanceRequest.DeptName = $scope.selectedDepartmentName;
        }
        
        console.log("Request:", $scope.attendanceRequest);
        $scope.isCardHidden = true;
        $scope.isLoading = true;
        $scope.isProcessing = true;
        $http({
            method: "POST",
            url: "/api/DailyAttendance/GetDateWiseAttendance",
            data: $scope.attendanceRequest
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.attendanceList = resp.Data;
                console.log("attendanceList", $scope.attendanceList);
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

    $scope.cancel = function () {
        $scope.isCardHidden = false;
        $scope.attendanceRequest = {};
        $scope.attendanceList = [];
    };

    $scope.setEndDate = function () {
        if ($scope.attendanceRequest.DateFrom) {
            var fromDate = new Date($scope.attendanceRequest.DateFrom);
            fromDate.setDate(fromDate.getDate() + 30);
            $scope.attendanceRequest.DateTo = fromDate.toISOString().split('T')[0]; // Format as yyyy-MM-dd
        }
    };

    $scope.export = function () {
        if (!$scope.attendanceList || $scope.attendanceList.length === 0) {
            alert("No data to export.");
            return;
        }

        // Helper function to format time
        function formatTime(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // shortTime format
        }

        // Map the table data for export
        var exportData = $scope.attendanceList.map(item => ({
            'Code #': item.EnrollNo || '',
            'Name': item.EnrollName || '',
            'Department': item.DepartmentName || '',
            'Clock In': formatTime(item.ClockIn),
            'Clock Out': formatTime(item.ClockOut),
            'Hours Worked': Math.round(item.HrsWorked || 0),
            'Late Mins': Math.round(item.LateMins || 0),
            'Early Mins': Math.round(item.EarlyMins || 0),
            'Overtime Mins': Math.round(item.OvertimeMins || 0)
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
        var doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }); // <-- updated


        if (!$scope.attendanceList || $scope.attendanceList.length === 0) {
            alert("No attendance records to print.");
            return;
        }

        var emp = $scope.attendanceList[0] || {};

        doc.setFontSize(20);
        doc.text($scope.generalSetting.CoyName, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

        // Set title
        var title = 'Daily Attendance Detail Report';
        doc.setFontSize(16);
        var titleX = doc.internal.pageSize.getWidth() / 2;
        var titleY = 22;
        doc.text(title, titleX, titleY, { align: 'center' });
        doc.line(titleX - doc.getTextWidth(title) / 2, 24, titleX + doc.getTextWidth(title) / 2, 24);

        // Employee Info Labels (from first entry)
        doc.setFontSize(12);
        let infoY = 30;
        doc.text(`Department Name: ${emp.DepartmentName || ''}`, 14, infoY);
        let formattedDate = emp.AttDate ? new Date(emp.AttDate).toISOString().split('T')[0] : '';
        doc.text(`Date: ${formattedDate}`, 105, infoY);

       
        // Table headers
        var headers = [[
            'Code #', 'Name', 'Department', 'Clock In', 'Clock Out',
            'Hours Worked', 'Late Mins', 'Early Mins', 'Overtime Mins'
        ]];

        // Table body
        var data = ($scope.attendanceList || []).map(function (item) {
            return [
                item.EnrollNo || '',
                item.EnrollName || '',
                item.DepartmentName || '',
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
        /*  doc.save('AttendanceDetailVoucher.pdf');*/
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






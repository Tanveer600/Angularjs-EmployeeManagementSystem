myApp.controller('dashboardController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.enrollmentList = [];
    $scope.dailyAttendanceList = [];
    $scope.attendanceList = [];
    $scope.isSortedAsc = true;
    $scope.CurrentEnrollment = {};
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.isProcessing = false;
    $scope.isLoading = false;
  
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    };
    // Call Init function when controller loads
    //Init();
    function Init() {
        var today = new Date();
        var todayFormatted = formatDate(today);
        $scope.attendanceRequest = {
            DateFrom: todayFormatted,
            DateTo: todayFormatted
        };     
        getPresentAttendanceToday();
        //$timeout(function () {
        //    $scope.getAttendanceGraphData("present");
        //}, 3000); 
    }
   
  
    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; 
    }


    function getPresentAttendanceToday() {

        var today = new Date();
        var todayFormatted = formatDate(today);
        $scope.attendanceRequest = {
            DateFrom: todayFormatted,
            DateTo: todayFormatted
        };

        if (!$scope.attendanceRequest.DateFrom || !$scope.attendanceRequest.DateTo) {
            alert("Invalid request data. Please ensure all fields are filled.");
            return;
        }
        console.log("Sending Attendance Request:", $scope.attendanceRequest); 

        $scope.isLoading = true;
        $scope.isProcessing = true;

        $http({
            method: "POST",
            url: "/api/DailyAttendance/GetCurrentAttendanceToday",
            data: $scope.attendanceRequest
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            $scope.isProcessing = false;

            if (resp.IsSuccess) {
                $scope.attendanceList = resp.Data;
                if (resp.IsSuccess && resp.Data.length > 0) {
                    var viewModel = resp.Data[0]; 
                    $scope.attendanceList = viewModel.attendanceList;
                    $scope.totalEnrolled = viewModel.TotalEnrolled;
                    $scope.todaysPresent = viewModel.TodaysPresent;
                    $scope.todaysAbsent = viewModel.TodaysAbsent;
                    $scope.DepartmentalAttendance = viewModel.DepartmentalAttendance;
                    console.info("$scope.Departmental Attendance", $scope.DepartmentalAttendance);

                      }
            }
        }, function (error) {
            $scope.isLoading = false;
            $scope.isProcessing = false;
            console.error("Error fetching attendance data", error);
            alert("Unable to fetch data. Please try again later.");
        });
    }

  
    $scope.getAttendanceGraphData = function (type) {
        const today = new Date();
        let fromDate, toDate;

        if (type === "present") {
            fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
            toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            console.log("Fetching PRESENT attendance data from", fromDate, "to", toDate);
        } else {
            fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            toDate = new Date(today.getFullYear(), today.getMonth(), 0);
            console.log("Fetching absent attendance data from", fromDate, "to", toDate);
        }

        $scope.attendanceRequest.DateFrom = fromDate.toISOString();
        $scope.attendanceRequest.DateTo = toDate.toISOString();

        if (!$scope.attendanceRequest.DateFrom || !$scope.attendanceRequest.DateTo) {
            alert("Invalid request data. Please ensure all fields are filled.");
            return;
        }

        $scope.isLoading = true;
        $scope.isProcessing = true;

        $http({
            method: "POST",
            url: "/api/DailyAttendance/GetAttendancePercentage",
            data: $scope.attendanceRequest
        }).then(function (response) {
            $scope.isLoading = false;
            $scope.isProcessing = false;

            var resp = response.data;
            if (resp.IsSuccess && resp.Data.length > 0) {
                const data = resp.Data;
                console.info("data", data);
                const departments = data.map(x => x.DepartmentName);
                const present = data.map(x => x.PresentPercentage);
                const absent = data.map(x => x.AbsentPercentage);
                const total = data.map(x => x.TotalEmployees);
                updateAttendanceChart(departments, present, absent, total);
            } else {
                console.warn("API returned success=false or empty data:", resp);
            }

        }, function (error) {
            $scope.isLoading = false;
            $scope.isProcessing = false;
            console.error("Error fetching attendance data", error);
        });
    }
    function updateAttendanceChart(departments, present, absent, total) {
        const colors = ['#405189', '#f06548', '#0ab39c']; // Present, Absent, Total Employees

        const options = {
            series: [
                {
                    name: 'Present',
                    type: 'bar',
                    data: present
                },
                {
                    name: 'Absent',
                    type: 'area',
                    data: absent
                },
                {
                    name: 'Total Employees',
                    type: 'bar',
                    data: total
                }
            ],
            chart: {
                height: 374,
                type: 'line',
                toolbar: { show: false }
            },
            stroke: {
                curve: 'smooth',
                dashArray: [0, 3, 0],
                width: [0, 1, 0]
            },
            fill: {
                opacity: [1, 0.1, 1]
            },
            markers: {
                size: [0, 4, 0],
                strokeWidth: 2,
                hover: { size: 4 }
            },
            xaxis: {
                categories: departments,
                axisTicks: { show: false },
                axisBorder: { show: false }
            },
            grid: {
                show: true,
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: false } },
                padding: { top: 0, right: -2, bottom: 15, left: 10 }
            },
            legend: {
                show: true,
                horizontalAlign: 'center',
                offsetX: 0,
                offsetY: -5,
                markers: {
                    width: 9,
                    height: 9,
                    radius: 6
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 0
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: '30%',
                    barHeight: '70%'
                }
            },
            colors: colors,
            tooltip: {
                shared: true,
                y: [{
                    formatter: function (y) {
                        return typeof y !== "undefined" ? y.toFixed(0) : y;
                    }
                }, {
                    formatter: function (y) {
                        return typeof y !== "undefined" ? y.toFixed(2) + "%" : y;
                    }
                }, {
                    formatter: function (y) {
                        return typeof y !== "undefined" ? y.toFixed(0) : y;
                    }
                }]
            }
        };

        if (window.attendanceChart) {
            window.attendanceChart.updateOptions({
                series: options.series,
                xaxis: options.xaxis
            });
        } else {
            window.attendanceChart = new ApexCharts(document.querySelector("#projects-overview-chart"), options);
            window.attendanceChart.render();
        }
    }


    $scope.exportToExcel = function () {
        // Prepare worksheet data
        var data = $scope.attendanceList.map(function (att) {
            return {
                "Enroll No": att.EnrollNo,
                "Name": att.EnrollName,
                "Department": att.DepartmentName,
                "Shift": att.ShiftName,
                "Date": att.AttDate ? new Date(att.AttDate).toLocaleDateString() : '',
                "Status": att.Status,
                "Clock In": att.ClockIn ? new Date(att.ClockIn).toLocaleTimeString() : '',
                "Clock Out": att.ClockOut ? new Date(att.ClockOut).toLocaleTimeString() : ''
            };
        });

        // Create worksheet and workbook
        var worksheet = XLSX.utils.json_to_sheet(data);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Today Present Report");

        // Export to Excel
        XLSX.writeFile(workbook, "Today_Present_Report.xlsx");
    };

  
});

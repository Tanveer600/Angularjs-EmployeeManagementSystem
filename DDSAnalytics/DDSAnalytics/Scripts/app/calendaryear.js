myApp.controller('calendarYearController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.CalendarYearList = [];
    $scope.isSortedAsc = true;
    $scope.currentCalendarYear = {};
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {
        getAllCalendarYear();

    }
    function getAllCalendarYear() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/CalendarYear/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.CalendarYearList = resp.Data;
                console.log("CalendarYearList", $scope.CalendarYearList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    }
    function formatDateLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    //save data 
    $scope.save = function () {
        if ($scope.currentCalendarYear.StartDate instanceof Date) {
            $scope.currentCalendarYear.StartDate = formatDateLocal($scope.currentCalendarYear.StartDate);
        }
        if ($scope.currentCalendarYear.EndDate instanceof Date) {
            $scope.currentCalendarYear.EndDate = formatDateLocal($scope.currentCalendarYear.EndDate);
        }
        // Proceed with save logic
        $scope.isProcessing = true;
        $timeout(function () {
            $http({
                method: "POST",
                url: "/api/CalendarYear/Save",
                data: $scope.currentCalendarYear,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;

                if (resp.IsSuccess) {
                    $scope.levaeTypeList = resp.Data;
                    console.log("levae type List  Updated:", $scope.levaeTypeList);

                    // Show success message
                    Swal.fire({
                        title: $scope.editMode ? "Calendar Year Updated Successfully!" : "Calendar Year Save Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: false,
                    });

                    // Refresh client list
                    getAllCalendarYear();

                    // Close modal
                    $('#showCalendarYearModal').modal('hide');
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
    $scope.cancel = function () {
        $scope.isCardHidden = false;
        $scope.LeaveRequest = {};
        $scope.leaveReportList = [];
    }


    $scope.getEdit = function (u) {
        $scope.currentCalendarYear = angular.copy(u);
        $scope.editMode = true;
    }

    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.currentCalendarYear = {};

    }


    $scope.getDelete = function (u) {
        $scope.currentCalendarYear = angular.copy(u);
        console.log("Delete button clicked for Calendar Year :", u);
        Swal.fire(
            {
                title: "Are you sure, you to delete this Calendar Year?",
                text: u.Title,
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
            url: "/api/CalendarYear/Remove",
            data: $scope.currentCalendarYear,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                // Close the delete modal if necessary
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected Calendar Year has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                getAllCalendarYear();
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

















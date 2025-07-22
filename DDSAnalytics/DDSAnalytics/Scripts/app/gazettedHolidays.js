myApp.controller('gazettedHolidaysController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.gazettedHolidaysList = [];
    $scope.holiday = {};
    $scope.isSortedAsc = true;
    $scope.pageSize = 10; 
    $scope.isSaving = false;

    $scope.updatePageSize = function () {
    };

    Init();
    function Init() {

      
        gazettedHolidays();
       

    }
  
   
    function gazettedHolidays() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/gazettedHolidays/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {

                $scope.gazettedHolidaysList = resp.Data;
                console.info("gazettedHolidaysList", $scope.gazettedHolidaysList);
            }
        },
            function (er) {
                alert("data not found", er);
            }
        );
    };



    //save data 
    $scope.save = function () {
        const payload = angular.copy($scope.holiday);
        payload.StartDate = formatDateToLocalYYYYMMDD(payload.StartDate);
        payload.EndDate = formatDateToLocalYYYYMMDD(payload.EndDate);
        $scope.isSaving = true;

        $http({
            method: "POST",
            url: "/api/gazettedHolidays/Save",
            data: payload,
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                $scope.gazettedHolidaysList = resp.Data;
                if ($scope.editMode == false) {
                    Swal.fire({
                        title: "Gazetted Holidays Save Successfully!",
                        text: "Selected Gazetted Holidays has been Saved.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                } else {
                    Swal.fire({
                        title: "Gazetted Holidays Updated Successfully!",
                        text: "Selected Gazetted Holidays Row has been Updated.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                }
                $scope.isSaving = false;

                $('#showGazettedModal').modal('hide');
                gazettedHolidays();

                // Redirect to home/login page
                //$window.location.href = '/home/login';
            }
        }, function (er) {
            $window.alert("No work has been done", er);
        });
    };


    $scope.getEdit = function (u) {
        $scope.holiday = angular.copy(u);

        // Convert to local Date object (no timezone issue in ng-model)
        $scope.holiday.StartDate = new Date(u.StartDate);
        $scope.holiday.EndDate = new Date(u.EndDate);

        $scope.editMode = true;
    };

    function formatDateToLocalYYYYMMDD(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.holiday = {};

    }


    $scope.getDelete = function (u) {
        $scope.holiday = u;
        console.log("Delete button clicked for Gazetted Holidays:", u);

        Swal.fire(
            {
                title: "Are you sure, you to delete this Gazetted Holidays?",
              
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
            url: "/api/gazettedHolidays/Remove",
            data: $scope.holiday,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
              
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected Gazetted Holidays has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                gazettedHolidays();
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






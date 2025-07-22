myApp.controller('leaveTypeController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.levaeTypeList = [];
    $scope.isSortedAsc = true;
    $scope.currentLeaveType = {};
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {
        getAllLeaveType();
    
    }
    function getAllLeaveType() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/LeaveType/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.levaeTypeList = resp.Data;
                console.log("levaeTypeList", $scope.levaeTypeList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    }
   
    //save data 
    $scope.save = function () {
        // Proceed with save logic
        $scope.isProcessing = true;
        $timeout(function () {
            $http({
                method: "POST",
                url: "/api/LeaveType/Save",
                data: $scope.currentLeaveType,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;

                if (resp.IsSuccess) {
                    $scope.levaeTypeList = resp.Data;
                    console.log("levae type List  Updated:", $scope.levaeTypeList);

                    // Show success message
                    Swal.fire({
                        title: $scope.editMode ? "Leave Type Updated Successfully!" : "Leave Type Save Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: false,
                    });

                    // Refresh client list
                    getAllLeaveType();

                    // Close modal
                    $('#showLeaveTypeModal').modal('hide');
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
        $scope.currentLeaveType = angular.copy(u);
        $scope.editMode = true;
    }

    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.currentLeaveType = {};
       
    }


    $scope.getDelete = function (u) {
        $scope.currentLeaveType = angular.copy(u);
        console.log("Delete button clicked for Leave Type:", u);
        Swal.fire(
            {
                title: "Are you sure, you to delete this Leave Type?",
                text: u.LeaveTypeName,
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
            url: "/api/LeaveType/Remove",
            data: $scope.currentLeaveType,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                // Close the delete modal if necessary
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected Leave Type has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                getAllLeaveType();
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

















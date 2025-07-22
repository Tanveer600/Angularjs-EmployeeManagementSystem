myApp.controller('roleSettingController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.roleList = [];
    $scope.isSortedAsc = true;
    $scope.rolesSetting = {};
    $scope.pageSize = 10;
    $scope.currentPage = 1;
  $scope.isProcessing = false;
  $scope.selectedRoleName = "";
    $scope.isLoading = false;
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {
        getAllRoles();
    }

    function getAllRoles() {
        $scope.isLoading = true;
        $http({
            method: "POST",
            url: "/api/UserRole/Get",
            data: null
        }).then(function (response) {
            var resp = response.data;
            $scope.isLoading = false;
            if (resp.IsSuccess) {
                $scope.roleList = resp.Data;
                // console.log("roleList", $scope.roleList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    }
    //save data 
    $scope.saveUserRole = function () {
        // Proceed with save logic
        $scope.isProcessing = true;
        $timeout(function () {
            $http({
                method: "POST",
                url: "/api/UserRole/Save",
                data: $scope.rolesSetting,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;

                if (resp.IsSuccess) {
                    $scope.roleList = resp.Data;
                    console.log("User Role List Updated:", $scope.roleList);

                    // Show success message
                    Swal.fire({
                        title: $scope.editMode ? "User Role Updated Successfully!" : "User Role Save Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary add-btn w-xs mt-2",
                        buttonsStyling: false,
                    });

                    // Refresh client list
                  getAllRoles();
                  $scope.rolesSetting = {};

                    // Close modal
                    $('#permissionsModal').modal('hide');
                } else {
                    console.error("Save operation failed:", resp);
                }

                $scope.isProcessing = false;
            }).catch(function (error) {
               
                $scope.isProcessing = false;
            });
        }, 500);
    };




    $scope.editRole = function (c) {
      $scope.rolesSetting = angular.copy(c);
      $scope.selectedRoleName = c.Name;
        $scope.editMode = true;
    }
    $scope.viewRole = function (c) {
        $scope.rolesSetting = angular.copy(c); // load the selected role
        $scope.selectedRoleName = c.Name;      // set selected role name
        $scope.editMode = false;                // important: not edit mode, view-only
    };

    //create new data
    $scope.createNew = function () {
        $scope.editMode = true;
        $scope.rolesSetting = {};
    }


    $scope.deleteRole = function (c) {
        $scope.rolesSetting = angular.copy(c);
        console.log("Delete button clicked for User Role:", c);
        Swal.fire(
            {
                title: "Are you sure, you to delete this User Role?",
                text: c.Name,
                icon: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn btn-primary add-btn w-xs me-2 mt-2",
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
            url: "/api/UserRole/Remove",
            data: $scope.rolesSetting,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                // Close the delete modal if necessary
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected User Role has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                getAllRoles();
                $scope.rolesSetting = {};
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






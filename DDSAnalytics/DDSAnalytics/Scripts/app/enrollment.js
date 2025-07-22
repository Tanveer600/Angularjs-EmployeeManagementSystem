myApp.controller('enrollmentController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.enrollmentList = [];
    $scope.isSortedAsc = true;
    $scope.CurrentEnrollment = {};
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
                // console.log("enrollmentList", $scope.clientList);
            }
        }, function (er) {
            alert("data not found", er);
        }
        );
    }
    //save data 
    $scope.save = function () {
        var existingClient = $scope.enrollmentList.find(function (enrollment) {
            return enrollment.DeptName === $scope.CurrentEnrollment.DeptName && enrollment.ID !== $scope.CurrentEnrollment.ID; // Exclude current client
        });

        if (existingClient) {
            // Name already exists
            Swal.fire({
                text: 'Enrollment with the same name already exists',
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
                url: "/api/Enrollment/Save",
                data: $scope.CurrentEnrollment,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;

                if (resp.IsSuccess) {
                    $scope.enrollmentList = resp.Data;
                    console.log("enrollment List Updated:", $scope.enrollmentList);

                    // Show success message
                    Swal.fire({
                        title: $scope.editMode ? "enrollment Updated Successfully!" : "enrollment Save Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: false,
                    });

                    // Refresh client list
                    getAllEnrollments();

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
        $scope.CurrentEnrollment = angular.copy(c);
        $scope.editMode = true;
    }

    //create new data
    $scope.createNew = function () {
        $scope.editMode = false;
        $scope.CurrentEnrollment = {};
    }


    $scope.getDelete = function (c) {
        $scope.CurrentEnrollment = angular.copy(c);
        console.log("Delete button clicked for Enrollment:", c);
        Swal.fire(
            {
                title: "Are you sure, you to delete this Enrollment?",
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
            url: "/api/Enrollment/Remove",
            data: $scope.CurrentEnrollment,
            dataType: 'json',
            headers: { "Content-Type": "application/json" }
        }).then(function (response) {
            var resp = response.data;
            if (resp.IsSuccess) {
                // Close the delete modal if necessary
                Swal.fire(
                    {
                        title: "Deleted Successfully!",
                        text: "Selected Enrollment has been deleted.",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: !1
                    });
                getAllEnrollments();
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






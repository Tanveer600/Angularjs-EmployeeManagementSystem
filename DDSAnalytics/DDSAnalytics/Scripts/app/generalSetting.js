myApp.controller('generalSettingController', function ($scope, $http, $window, $timeout) {
    $scope.editMode = false;
    $scope.isSortedAsc = true;
    $scope.generalSetting = {};
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.isProcessing = false;
    $scope.isLoading = false;
    $scope.getCurrentPage = function (currPage) {
        $scope.currentPage = currPage;
    }

    Init();
    function Init() {
        getSettings();  
    }

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

    //save data 
    $scope.saveSettings = function () {
        // Proceed with save logic
        $scope.isProcessing = true;
        $timeout(function () {
            $http({
                method: "POST",
                url: "/api/GeneralSetting/Save",
                data: $scope.generalSetting,
            }).then(function (response) {
                console.log("Response received: ", response);
                var resp = response.data;
                if (resp.IsSuccess) {
                    var settings = resp.Data;
                    //$scope.generalSetting = settings[0];

                    // Show success message
                    Swal.fire({
                        title: "Settings Saved Successfully!",
                        icon: "success",
                        confirmButtonClass: "btn btn-primary w-xs mt-2",
                        buttonsStyling: false,
                    });
                

                } else {
                    console.error("Save operation failed:", resp);
                }

                $scope.isProcessing = false;
            }).catch(function (error) {
                console.error("Error during save operation:", error);               
                $scope.isProcessing = false;
            });
        }, 500);
    };


  
});






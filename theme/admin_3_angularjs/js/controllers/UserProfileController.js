
angular.module('MetronicApp').controller('UserProfileController', function ($rootScope, $scope, $state, $stateParams,$http, $timeout) {
    $scope.$on('$viewContentLoaded', function () {
        App.initAjax(); // initialize core components
        //Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_profile')); // set profile link active in sidebar menu
    });


    if($stateParams.username!=null){
        console.log("im inside");
        $scope.accountSelect={
            username:$stateParams.username
        }
    };



    //获取用户列表数据
    $scope.manager = null;
    $scope.users = [];
    $http({
        method: 'POST',
        url: '/user',
        data:{
            action:'get'
        },
        //url: 'accountData.json'
    }).success(function (data, status, headers, config) {
        console.log("success...");
        angular.forEach(data.users,function(user){
            if(user.role=="admin"){
                $scope.manager = user;
            }else{
                $scope.users.push(user);
            }
        })

    }).error(function (data, status, headers, config) {
        console.log("error...");
    });
    
    //点选管理员标签
    $scope.manageSelect = function (accountSelect) {
        if (this.accountSelect && accountSelect.username == $scope.manager.username) {
            this.accountSelect = null;
        } else {
            this.accountSelect = $scope.manager;
        }
    }

    //删除用户
    $scope.remove = function () {
        if (this.accountSelect.role == "admin") {
            alert("管理员账户无法被删除");
            return;
        }
        var accountInner = this.accountSelect;
        angular.forEach($scope.users, function (user, index) {
            if (user.username == accountInner.username) {
                $http({
                    method: 'POST',
                    data:{username:accountInner.username},
                    url: '/user',
                    data:{
                        action:'del'
                    }
                }).success(function (data, status, headers, config) {
                    console.log("success...");
                    console.log($scope.users);
                    $scope.users.splice(index,1);
                }).error(function (data, status, headers, config) {
                    console.log("error...");
                });
            }
        })
    }

    //跳转修改密码页面
    $scope.gotoEdit = function () {
        var accountSelect=this.accountSelect;
        if (accountSelect) {
            console.log(accountSelect.username);
            $state.go("profile.changepassword",{username:accountSelect.username});
            $scope.accountSelect=accountSelect;
        } else {
            alert("还未选择用户");
        }
    }

    //修改密码
    $scope.changePass={
        username:'',
        oldpass:'',
        newpass:''
    };
    $scope.changePassword = function () {
        var account={
            action:'modify',
            username:$scope.accountSelect.username,
            oldpassword:$scope.changePass.oldpass,
            newpassword:$scope.changePass.newpass
        }
        console.log(account);
        $http({
            method: 'POST',
            data: account,
            url: '/user'
        }).success(function (data, status, headers, config) {
            console.log("success...");
        }).error(function (data, status, headers, config) {
            console.log("error...");
        });
    }

    //新增用户
    $scope.newAccount={
        username:'',
        password:''
    }
    $scope.postAccountData=function(){
        console.log($scope.newAccount);
        var newAccount = {
            action:'add',
            username: $scope.newAccount.username,
            password: $scope.newAccount.password
        };
        console.log(newAccount);
        $http.post(
            '/user',
            newAccount).success(function(){
            console.log("post success");
            alert("新建账号成功" );
            $(".add").modal("hide");
        }).error(function(status) {
            alert("failure message:" + JSON.stringify({data:status}));
        });
    }





// set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $rootScope.settings.layout.pageSidebarClosed = true;
}).directive('account', function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: '<div ng-transclude></div>',
        controller: function ($scope) {
            var expanders = [];
            this.gotOpened = function (selectedExpander) {
                angular.forEach(expanders, function (expander) {
                        if (selectedExpander != expander) {
                        } else {
                            if ($scope.accountSelect && $scope.accountSelect.username == expander.username) {
                                $scope.accountSelect = null;
                                //cookie.set('selectAccount','',0.5);
                            } else {
                                angular.forEach($scope.users, function (user) {
                                        if (user.username == expander.username) {
                                            $scope.accountSelect = user;
                                            //cookie.set('selectAccount',user.username,0.5);
                                        }
                                    }
                                );

                            }
                        }
                    }
                );
            }

            this.addUser = function (expander) {
                expanders.push(expander);
            }


        }
    }
}).directive('accountselect', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        require: '^?account',
        scope: {
            username: '=username'
        },
        template: '<div ng-click="choose()" class="operator-div">' + '<div class="body" ng-transclude></div> ' + '</div>',
        link: function (scope, element, attrs, accountCtrl) {
            scope.select = false;
            accountCtrl.addUser(scope);
            scope.choose = function () {
                accountCtrl.gotOpened(scope);
                console.log(scope.username);
                console.log(0);
            }
        }
    }
})




//
var goback = function () {
    window.history.back(-1);
}
//cookie操作
//var cookie = {
//    set:function(key,val,time){//设置cookie方法
//        var date=new Date(); //获取当前时间
//        var expiresDays=time;  //将date设置为n小时以后的时间
//        date.setTime(date.getTime()+expiresDays*3600*1000); //格式化为cookie识别的时间
//        document.cookie=key + "=" + val +";expires="+date.toGMTString();  //设置cookie
//    },
//    get:function(key){//获取cookie方法
//        /*获取cookie参数*/
//        var getCookie = document.cookie.replace(/[ ]/g,"");  //获取cookie，并且将获得的cookie格式化，去掉空格字符
//        var arrCookie = getCookie.split(";")  //将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中
//        var tips;  //声明变量tips
//        for(var i=0;i<arrCookie.length;i++){   //使用for循环查找cookie中的tips变量
//            var arr=arrCookie[i].split("=");   //将单条cookie用"等号"为标识，将单条cookie保存为arr数组
//            if(key==arr[0]){  //匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作
//                tips=arr[1];   //将cookie的值赋给变量tips
//                break;   //终止for循环遍历
//            }
//        }
//        return tips;
//    }
//}

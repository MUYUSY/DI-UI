/* Setup general page controller */
angular.module('MetronicApp').controller('EventTreeController', ['$rootScope', '$scope', 'settings', function ($rootScope, $scope, settings) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();

        // set default layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        var obj = decodeURIComponent($.urlParam('json'));

        var req = JSON.parse(obj);
        $scope.start = timeStamp2String(req.timeRange.start, "yyyy-MM-dd hh:mm:ss");
        $scope.end = timeStamp2String(req.timeRange.end, "yyyy-MM-dd hh:mm:ss");
        $scope.devicename = req.deviceName;

     d3.select("#export").on("click", function () {
        var html = d3.select("svg")
                .attr("version", 1.1)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .node().parentNode.innerHTML;
        console.info(html);

        //console.log(html);
        var blob = new Blob([html], {type: "image/svg+xml;base64"});
        saveAs(blob, "eventTree.svg");
    });

        $("#save").click(function () {
            $("#rulename").show();
            $(this).hide();
            $("#confirm").show();
            $("#cancel").show();
        });

        $("#confirm").click(function () {
            $(this).hide();
            $("#rulename").hide();
            $("#cancel").hide();
            $("#save").show(200);
            $("#save").html('<img src="./icon/edit.png" style="margin: 0 4px 1px 0">更改名称')
        });

        $("#cancel").click(function () {
            $("#save").show(200);
            $("#rulename").hide();
            $("#confirm").hide();
            $(this).hide();
        });

        $.ajax({
            method: "POST",
            url: "treequery",
            data: JSON.stringify({
                "timestamp": req.timestamp,
                "pid": req.pid,
                "device_guid": req.deviceId,
                "processname": req.processPath
            })
        }).success(function (data) {
            var error;
            renderTree(error, data, req);
        }).done(function (msg) {
            //alert( "Data Saved: " + msg );
        });
    });
}]);

var timeStamp2String = function (time, format) {
    if (typeof(time) === "number") {
        time = time.toString();
    }
    if (time.length !== 10 && time.length !== 13) {
        return time;
    }
    if (time.length === 10) {
        time = time * 1000;
    }
    var datetime = new Date();
    datetime.setTime(time);
    return datetime.format(format);
};

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};


var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
};

function ModalCtrl($scope, $uibModal) {
    $scope.saveRule = function (size) {
        var obj = decodeURIComponent($.urlParam('json'));
        var modalInstance = $uibModal.open(
            {
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    ruleName: function () {
                        return $scope.ruleName;
                    },
                    condition: function () {
                        return obj;
                    }
                }
            });
    };
}

function ModalInstanceCtrl($scope, $modalInstance, ruleName, condition) {
    $scope.ruleName = ruleName;

    $scope.ok = function () {
        $modalInstance.close($scope.ruleName);
        var saveJson = {
            "action": "add",
            "name": $scope.ruleName,
            "type": 2,
            "time": moment().unix(),
            "data": JSON.parse(condition)
        };
        $.ajax({
            async: false,
            url: "investigationrecord",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(saveJson),
            success: function (data) {
                DIalert("success", "保存成功!")
            },
            error: function(data) {
                DIalert("warning", "保存失败!")
            }
        });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}


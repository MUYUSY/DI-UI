'use strict';
var app = angular.module('ddesApp');
app.directive("simpleMindmap", function() {
    var COLOR_DEFAULT = "#337ab7";
    var COLOR_HIGHLIGHT = "#d64541";
    var COLOR_HOVER = "#26a3d3";
    var COLOR_SUSPICIOUS = "#f7ca18";
    var LEVEL_WIDTH = 210;
    var LEVEL_HEIGHT = 25;
    var NODE_WIDTH = 145;

    return {
        restrict: 'C',
        replace: true,
        scope: {
            // mindmapParam: '=',
            mindmapData: '=',
            detectedObjects: '=',
            objectsMeta: '=',
            // actionList: '=',
            // updateSignal: '=',
            // updateQueue: '=',
            // updateContents: '=',
            // centerNode: '=',
            fullSize: '=' //,
                // screenSize: '=',
                // currentPosition: '='
        },
        controller:['$scope', '$element', '$window', '$log', '$compile', '$timeout', 'Notification','OBJECT_DEF', function($scope, $element, $window, $log, $compile, $timeout, Notification, OBJECT_DEF) {
            // $log.debug(JSON.stringify($scope.mindmapData));
            // $log.debug(JSON.stringify($scope.detectedObjects));
            //$log.debug(JSON.stringify$scope.objectsMeta));
            //$log.debug(JSON.stringify$scope.actionList));

            var treeData = $scope.mindmapData;
            if (!treeData.children.length) return;
            var viewerWidth = $element.width();
            var viewerHeight = $element.height();
            // $scope.screenSize = [viewerWidth, viewerHeight];
            // $scope.subChainRequesting = false;

            // angular.element($window).bind("resize", function(e) {
            //     if (!baseSvg || !tree || !root) return;
            //     viewerWidth = $element.width();
            //     viewerHeight = $element.height();
            //     baseSvg.attr("width", viewerWidth);
            //     baseSvg.attr("height", viewerHeight);
            //     update(root);
            //     $scope.screenSize = [viewerWidth, viewerHeight];
            // });

            var i = 0;
            // var duration = 750;
            var duration = 0;
            var root;
            // var tree = d3.layout.tree().size([viewerHeight, viewerWidth]);
            var tree = d3.layout.tree().nodeSize([LEVEL_HEIGHT, LEVEL_WIDTH]);
            // define a d3 diagonal projection for use by the node paths later on.
            function diagonal(d, i) {
                var source = {
                    x: d.source.x,
                    y: d.source.y + NODE_WIDTH
                };
                var target = {
                    x: d.target.x,
                    y: d.target.y - 20
                };
                var p0 = {
                    x: source.y,
                    y: source.x
                };
                var p3 = {
                    x: (source.y + NODE_WIDTH) < target.y ? (source.y + NODE_WIDTH) : target.y,
                    y: target.x
                };
                var p4 = {
                    x: target.y,
                    y: target.x
                };
                var k = (p0.x + p3.x) / 2;
                var p = [p0, {
                    x: k,
                    y: p0.y
                }, {
                    x: k,
                    y: p3.y
                }, p3, p4];
                return "M" + p[0].x + "," + p[0].y + "C" + p[1].x + "," + p[1].y + " " + p[2].x + "," + p[2].y + " " + p[3].x + "," + p[3].y + "L" + p[4].x + "," + p[4].y;
            };

            function visit(parent, visitFn, childrenFn) {
                if (!parent) return;

                visitFn(parent);

                var children = childrenFn(parent);
                if (children) {
                    var count = children.length;
                    for (var i = 0; i < count; i++) {
                        visit(children[i], visitFn, childrenFn);
                    }
                }
            }

            function zoom() {
                // svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                // $scope.currentPosition = d3.event.translate;
                // $scope.$apply("currentPosition");
            }

            // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
            var zoomListener = d3.behavior.zoom().scaleExtent([1, 1]).on("zoom", zoom);

            // define the baseSvg, attaching a class for styling and the zoomListener
            var baseSvg = d3.select($element[0]).append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                .attr("class", "svg-container overlay")

            //.on('contextmenu', function(d, i) {
            //    d3.event.preventDefault();
            //});

            // Create icon masks
            var svgDef = baseSvg.append("defs");
            var iconTypes = ["collapse", "expand"];
            for (var x in OBJECT_DEF.TYPE) {
                iconTypes.push(OBJECT_DEF.TYPE[x]);
            }
            for (var x in iconTypes) {
                svgDef.append("mask")
                    .attr("id", "mask_" + iconTypes[x])
                    .attr("x", "0")
                    .attr("y", "0")
                    .attr("width", "24")
                    .attr("height", "24")
                    .append("image")
                    .attr("x", "0")
                    .attr("y", "0")
                    .attr("width", "24")
                    .attr("height", "24")
                    .attr("xlink:href", "images/mindmap/mask_" + iconTypes[x] + ".png");
            }

            // function setChildrenInRootCauseChain(d) {
            //     d.childrenInRootCauseChain = [];
            //     for (var x in d.children) {
            //         if ($scope.detectedObjects[d.children[x].objectId].rootCauseChain) {
            //             d.childrenInRootCauseChain.push(d.children[x]);
            //         }
            //     }
            // }

            function transitionEndCallback() {
                $scope.fullSize[1] = jQuery(svgGroup)[0][0].getBoundingClientRect().height;
                $scope.$apply("fullSize");

            }

            // function setDefaultMindmapData() {
            //     visit(treeData, function(d) {
            //         if (!d.children) d.children = [];
            //         d.childrenAll = [];
            //         // objectId and d3 tree object mapping
            //         if (d.objectId) $scope.detectedObjects[d.objectId].d3Object = d;
            //         // Expanded mode: childrenAll, Collapsed mode: childrenInRootCauseChain
            //         setChildrenInRootCauseChain(d);
            //         d.childrenAll = d.children;
            //     }, function(d) {
            //         return d.children && d.children.length > 0 ? d.children : null;
            //     });
            // }

            // function collapseNodeRecursive(d) {
            //     function collapseNodeRecursiveUnit(d) {
            //         d.children.forEach(collapseNodeRecursiveUnit);
            //         d.children = d.childrenInRootCauseChain;
            //     }
            //     collapseNodeRecursiveUnit(d);
            //     update(d);
            // }

            // function expandNodeRecursive(d) {
            //     function expandNodeRecursiveUnit(d) {
            //         d.children = d.childrenAll;
            //         d.children.forEach(expandNodeRecursiveUnit);
            //     }
            //     expandNodeRecursiveUnit(d);
            //     update(d);
            // }

            // function collapseNode(d) {
            //     d.children = d.childrenInRootCauseChain;
            //     update(d);
            // }

            // function expandNode(d) {
            //     d.children = d.childrenAll;
            //     update(d);
            // }

            // function isNodeCollapsible(d) {
            //     if (!d.children) d.children = [];
            //     if (d.children.length == d.childrenInRootCauseChain.length) return false;
            //     return true;
            // };

            // function isNodeExpandable(d) {
            //     if (!d.children)
            //         d.children = [];
            //     if (d.children.length == d.childrenAll.length)
            //         return false;
            //     return true;
            // };

            // function isNodeChildrenCollapsible(d) {
            //     function isNodeCollapsibleRecursiveUnit(d) {
            //         if (!d.children.length) return false;
            //         for (var x = 0; x < d.children.length; x++) {
            //             if (isNodeCollapsible(d.children[x])) return true;
            //         }
            //         d.children.forEach(isNodeCollapsibleRecursiveUnit);
            //     }
            //     if (isNodeCollapsible(d)) return true;
            //     return isNodeCollapsibleRecursiveUnit(d);
            // }

            // function isNodeChildrenExpandable(d) {
            //     function isNodeExpandableRecursiveUnit(d) {
            //         if (!d.children.length) return false;
            //         for (var x = 0; x < d.children.length; x++) {
            //             if (isNodeExpandable(d.children[x])) return true;
            //         }
            //         d.children.forEach(isNodeExpandableRecursiveUnit);
            //     }
            //     if (isNodeExpandable(d)) return true;
            //     return isNodeExpandableRecursiveUnit(d);
            // }

            // $scope.isNodeCollapsible = function(id) {
            //     var d = $scope.detectedObjects[id].d3Object;
            //     return isNodeCollapsible(d);
            // };

            // $scope.isNodeExpandable = function(id) {
            //     var d = $scope.detectedObjects[id].d3Object;
            //     return isNodeExpandable(d);
            // };

            // $scope.isNodeChildrenCollapsible = function(id) {
            //     var d = $scope.detectedObjects[id].d3Object;
            //     return isNodeChildrenCollapsible(d);
            // };

            // $scope.isNodeChildrenExpandable = function(id) {
            //     var d = $scope.detectedObjects[id].d3Object;
            //     return isNodeChildrenExpandable(d);
            // };

            // $scope.isNodeInRootCauseChain = function(id) {
            //     if ($scope.detectedObjects[id].rootCauseChain)
            //         return true;
            //     return false;
            // };

            // $scope.isNodeInActionList = function(id) {
            //     if ($scope.actionList[id])
            //         return true;
            //     return false;
            // };

            // $scope.rccManipulation = function(objectIdList, isRcc) {
            //     var req = {
            //         objectIdList: objectIdList,
            //         isRcc: isRcc,
            //         pageSource: $scope.mindmapParam.pageSource,
            //         server: $scope.mindmapParam.server
            //     };
            //     ddesAPI.rccManipulation($scope.mindmapParam.taskGuid, $scope.mindmapParam.endpointGuid, req).then(function(res) {
            //         if (res.data.Code != 0 || res.data.Data.affectedCount != objectIdList.length) {
            //             $log.error("rccManipulation failed: ");
            //             $log.error(res);
            //             $alert({
            //                 title: 'API Failed - ',
            //                 content: 'Fail to manipulate root cause chain.',
            //                 container: ".notification-container",
            //                 placement: "top-right",
            //                 type: 'danger',
            //                 show: true,
            //                 duration: 10
            //             });
            //         } else {
            //             $log.log("rccManipulation succeeded: ");
            //             $log.log(res);
            //         }
            //     }, function(err) {});
            // };

            // $scope.getObjectSubChain = function(objectId) {
            //     var req = {
            //         pageSource: $scope.mindmapParam.pageSource,
            //         server: $scope.mindmapParam.server
            //     };
            //     $alert({
            //         title: 'Request sent - ',
            //         content: 'Sub-chain has been requested.',
            //         container: ".notification-container",
            //         placement: "top-right",
            //         type: 'info',
            //         show: true,
            //         duration: 10
            //     });
            //     $scope.subChainRequesting = true;
            //     ddesAPI.getObjectSubChain($scope.mindmapParam.taskGuid, $scope.mindmapParam.endpointGuid, objectId, req).then(function(res) {
            //         $scope.subChainRequesting = false;
            //         if (res.data.Code != 0) {
            //             $log.error("getObjectSubChain failed: ");
            //             $log.error(res);
            //             $alert({
            //                 title: 'API Failed - ',
            //                 content: 'Fail to get sub-chain.',
            //                 container: ".notification-container",
            //                 placement: "top-right",
            //                 type: 'danger',
            //                 show: true,
            //                 duration: 10
            //             });
            //         } else {
            //             $log.log("getObjectSubChain succeeded: ");
            //             $log.log(res);
            //             $alert({
            //                 title: 'Success - ',
            //                 content: 'Sub-chain appended.',
            //                 container: ".notification-container",
            //                 placement: "top-right",
            //                 type: 'success',
            //                 show: true,
            //                 duration: 10
            //             });
            //             var targetObjectId = res.data.Data.mindmap[0].objectId;
            //             // Append children to target node
            //             for (var x in res.data.Data.mindmap[0].children) {
            //                 res.data.Data.mindmap[0].children[x].childrenAll = [];
            //                 res.data.Data.mindmap[0].children[x].childrenInRootCauseChain = [];
            //                 // Only add node if it's not in children already
            //                 var existed = false;
            //                 for (var y in $scope.detectedObjects[targetObjectId].d3Object.childrenAll) {
            //                     if ($scope.detectedObjects[targetObjectId].d3Object.childrenAll[y].objectId == res.data.Data.mindmap[0].children[x].objectId) {
            //                         existed = true;
            //                         break;
            //                     }
            //                 }
            //                 if (!existed) {
            //                     $scope.detectedObjects[targetObjectId].d3Object.children.push(res.data.Data.mindmap[0].children[x]);
            //                     $scope.detectedObjects[targetObjectId].d3Object.childrenAll.push($scope.detectedObjects[targetObjectId].d3Object.children[$scope.detectedObjects[targetObjectId].d3Object.children.length - 1]);
            //                 }
            //             }
            //             // Append detectedObjects
            //             for (var x in res.data.Data.detectedObjects) {
            //                 if ($scope.detectedObjects[res.data.Data.detectedObjects[x].objectId]) continue;
            //                 $scope.detectedObjects[res.data.Data.detectedObjects[x].objectId] = res.data.Data.detectedObjects[x];

            //                 if(res.data.Data.rootCauseChain){ // TODO Need Server Side add empty array data
            //                     if (res.data.Data.rootCauseChain.indexOf(res.data.Data.detectedObjects[x].objectId) >= 0) {
            //                         $scope.detectedObjects[res.data.Data.detectedObjects[x].objectId].rootCauseChain = true;
            //                     } else {
            //                         $scope.detectedObjects[res.data.Data.detectedObjects[x].objectId].rootCauseChain = false;
            //                     }
            //                 }
            //             }
            //             // Append Meta
            //             for (var x in res.data.Data.meta) {
            //                 if ($scope.objectsMeta[res.data.Data.meta[x].objectId]) continue;
            //                 $scope.objectsMeta[res.data.Data.meta[x].objectId] = res.data.Data.meta[x];
            //             }
            //             // Update essential elements
            //             setChildrenInRootCauseChain($scope.detectedObjects[targetObjectId].d3Object);
            //             // Update tree
            //             update($scope.detectedObjects[targetObjectId].d3Object);
            //             // Update objectId to D3 Object binding
            //             $scope.detectedObjects[targetObjectId].d3Object.childrenAll.forEach(function(d) {
            //                 $scope.detectedObjects[d.objectId].d3Object = d;
            //             });
            //         }
            //     }, function(err) {});
            // };

            // $scope.dropdownActionExpandNode = function(id) {
            //     if ($scope.detectedObjects[id] && $scope.detectedObjects[id].d3Object)
            //         expandNode($scope.detectedObjects[id].d3Object);
            // };

            // $scope.dropdownActionCollapseNode = function(id) {
            //     if ($scope.detectedObjects[id] && $scope.detectedObjects[id].d3Object)
            //         collapseNode($scope.detectedObjects[id].d3Object);
            // };

            // $scope.dropdownActionExpandNodeRecursive = function(id) {
            //     if ($scope.detectedObjects[id] && $scope.detectedObjects[id].d3Object)
            //         expandNodeRecursive($scope.detectedObjects[id].d3Object);
            // };

            // $scope.dropdownActionCollapseNodeRecursive = function(id) {
            //     if ($scope.detectedObjects[id] && $scope.detectedObjects[id].d3Object)
            //         collapseNodeRecursive($scope.detectedObjects[id].d3Object);
            // };

            // $scope.dropdownActionAddNodeToRootCauseChain = function(id) {
            //     var rccManipulationList = [];

            //     function addNodeToRootCauseChainRecursiveUnit(d) {
            //         $scope.detectedObjects[d.objectId].rootCauseChain = true;
            //         rccManipulationList.push(d.objectId);
            //         if (d.parent && d.parent.objectId) {
            //             setChildrenInRootCauseChain($scope.detectedObjects[d.parent.objectId].d3Object);
            //             if (!$scope.detectedObjects[d.parent.objectId].rootCauseChain) {
            //                 addNodeToRootCauseChainRecursiveUnit(d.parent);
            //             }
            //         }
            //     }
            //     addNodeToRootCauseChainRecursiveUnit($scope.detectedObjects[id].d3Object);
            //     update($scope.detectedObjects[id].d3Object);
            //     $scope.updateContents();
            //     $scope.rccManipulation(rccManipulationList, true);
            // };

            // $scope.dropdownActionRemoveNodeFromRootCauseChain = function(id) {
            //     var rccManipulationList = [];

            //     function removeNodeToRootCauseChainRecursiveUnit(d) {
            //         if ($scope.detectedObjects[d.objectId].rootCauseChain == false) return;
            //         $scope.detectedObjects[d.objectId].rootCauseChain = false;
            //         rccManipulationList.push(d.objectId);
            //         if (d.parent && d.parent.objectId) {
            //             setChildrenInRootCauseChain($scope.detectedObjects[d.parent.objectId].d3Object);
            //         }
            //         d.childrenAll.forEach(removeNodeToRootCauseChainRecursiveUnit);
            //     }
            //     removeNodeToRootCauseChainRecursiveUnit($scope.detectedObjects[id].d3Object);
            //     update($scope.detectedObjects[id].d3Object);
            //     $scope.updateContents();
            //     $scope.rccManipulation(rccManipulationList, false);
            // };

            // $scope.dropdownActionAddNodeToActionList = function(id) {
            //     if (!$scope.actionList[id]) {
            //         $scope.actionList[id] = true;
            //     }
            // };

            // $scope.dropdownActionRemoveNodeFromActionList = function(id) {
            //     if ($scope.actionList[id]) {
            //         delete $scope.actionList[id];
            //     }
            // };

            // $scope.generateInvestigationCriteria = function(objectId) {
            //     var type = $scope.detectedObjects[objectId].objectType;
            //     var name = $scope.detectedObjects[objectId].objectName;
            //     var sha1 = $scope.objectsMeta[objectId].fileSha1;
            //     switch (type) {
            //         case "file":
            //             if (sha1)
            //                 return {
            //                     type: "file_content",
            //                     value: [sha1],
            //                     values: [sha1]
            //                 };
            //             else
            //                 return {
            //                     type: "file_content",
            //                     value: [name],
            //                     values: [name]
            //                 };
            //             break;
            //         case "ip":
            //             return {
            //                 type: "ip_string",
            //                 value: [name],
            //                 values: [name]
            //             };
            //             break;
            //         case "domain":
            //             return {
            //                 type: "dns_query",
            //                 value: [name],
            //                 values: [name]
            //             };
            //             break;
            //         case "user":
            //             return {
            //                 type: "user_account",
            //                 value: [name],
            //                 values: [name]
            //             };
            //             break;
            //         case "process":
            //             if (sha1)
            //                 return {
            //                     type: "file_content",
            //                     value: [sha1],
            //                     values: [sha1]
            //                 };
            //             else
            //                 return {
            //                     type: "file_content",
            //                     value: [name],
            //                     values: [name]
            //                 };
            //             break;
            //         case "registry":
            //             return {
            //                 type: "file_content",
            //                 value: [name],
            //                 values: [name]
            //             };
            //             break;
            //         case "service":
            //             if (sha1)
            //                 return {
            //                     type: "file_content",
            //                     value: [sha1],
            //                     values: [sha1]
            //                 };
            //             else
            //                 return {
            //                     type: "file_content",
            //                     value: [name],
            //                     values: [name]
            //                 };
            //             break;
            //         case "module":
            //             if (sha1)
            //                 return {
            //                     type: "file_content",
            //                     value: [sha1],
            //                     values: [sha1]
            //                 };
            //             else
            //                 return {
            //                     type: "file_content",
            //                     value: [name],
            //                     values: [name]
            //                 };
            //             break;
            //         default:
            //             return {};
            //             break;
            //     }
            // };

            // $scope.dropdownActionInvestigateFurther = function(objectIdList) {
            //     var retroTaskCriteria = [];
            //     for (var x in objectIdList) {
            //         retroTaskCriteria.push($scope.generateInvestigationCriteria(objectIdList[x]));
            //     }
            //     var req = {
            //         retroTaskCriteria: retroTaskCriteria,
            //         specificEndpoints: [],
            //         timeRange: "any"
            //     };

            //     ddesAPI.investigateFurther(req).then(function(res) {
            //         if (res.data.Code != 0) {
            //             $log.error("investigateFurther failed: ");
            //             $log.error(res);
            //             $alert({
            //                 title: 'API Failed - ',
            //                 content: 'Fail to investigate further.',
            //                 container: ".notification-container",
            //                 placement: "top-right",
            //                 type: 'danger',
            //                 show: true,
            //                 duration: 10
            //             });
            //         } else {
            //             $log.log("investigateFurther succeeded: ");
            //             $log.log(res);
            //             $alert({
            //                 title: 'Success - ',
            //                 content: 'Further investigation has been triggered.',
            //                 container: ".notification-container",
            //                 placement: "top-right",
            //                 type: 'success',
            //                 show: true,
            //                 duration: 10
            //             });
            //         }
            //     }, function(err) {});
            // };

            // $scope.dropdownActionInvestigateFurtherTMCM = function(objectIdList) {
            //     var retroTaskCriteria = [];
            //     for (var x in objectIdList) {
            //         retroTaskCriteria.push($scope.generateInvestigationCriteria(objectIdList[x]));
            //     }
            //     var param = {
            //         data: {
            //             targetEndpoints: "all",
            //             targetEndpointsSpecific: [],
            //             commandType: 0,
            //             arrCommandContext: [$scope.generateInvestigationCriteria(objectIdList[x])]
            //         }
            //     };
            //     jQuery("body").append("<form action='settings.php?serverid=" + $scope.mindmapParam.server + "' method='post' class='temp-form' style='display: none;'><input type='text' name='param' value='" + JSON.stringify(param) + "' /></form>");
            //     jQuery(".temp-form").submit();
            // };

            function initialPosition(source) {
                var scale = zoomListener.scale();
                x = 50 - LEVEL_WIDTH;
                y = -source.x0;
                y = y * scale + viewerHeight / 2;
                d3.select('g').transition()
                    .duration(duration)
                    .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
                zoomListener.scale(scale);
                zoomListener.translate([x, y]);
                // $scope.currentPosition = [x, y];
            }

            function centerNode(source) {
                var scale = zoomListener.scale();
                x = -source.y0;
                y = -source.x0;
                x = x * scale + viewerWidth / 2;
                y = y * scale + viewerHeight / 2;
                d3.select('g').transition()
                    .duration(duration)
                    .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
                zoomListener.scale(scale);
                zoomListener.translate([x, y]);
                // $scope.currentPosition = [x, y];
            }

            $scope.centerNode = function(d) {
                centerNode(d);
            };

            function angularCompile(d) {
                d.each(function(d, i) {
                    $compile(this)($scope);
                });
            }

            $scope.transformToDisplayFullView = function(d) {
                var hMin = d.x0;
                visit(d, function(d) {
                    if (d.x0 < hMin) {
                        hMin = d.x0;
                    }
                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                });
                d3.select('g').transition()
                    .duration(duration)
                    .attr("transform", "translate(" + (50 - LEVEL_WIDTH) + "," + (30 - hMin) + ")");

            };

            function update(source) {
                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);
                nodes.forEach(function(d) {
                    d.y = d.depth * LEVEL_WIDTH;
                });

                // Update the nodes
                var node = svgGroup.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("id", function(d) {
                        return "node_" + d.objectId;
                    })
                    .style("font-size", "13px")
                    .style("cursor", "default")
                    .attr("transform", function(d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .filter(function(d, i) {
                        if (d.objectId == null) return null;
                        return d;
                    })
                    .on("mouseover", function(d) {
                        $scope.mindmapNodePopoverObjectId = d.objectId;
                    });

                // Node icon background color
                nodeEnter.append("rect")
                    .attr("class", "node-icon mindmapNodePopover")
                    .attr("x", "0")
                    .attr("y", "0")
                    .attr("width", "24")
                    .attr("height", "24")
                    // .attr("bs-dropdown", function(d) {
                    //     return "{objectId: '" + d.objectId + "', pageSource: '" + $scope.mindmapParam.pageSource + "'}";
                    // })
                    // .attr("data-template", "shared/mindmap/mindmapNodeDropdownTemplate.html")
                    // .attr("container", "body")
                    // .attr("data-animation", "am-flip-x")
                    // .attr("placement", "right-bottom")
                    .style("fill", "#000000")
                    .style("opacity", 0)
                    .attr("transform", "translate(-12, -12)")
                    // .on("mouseover", function(d) {
                    // d3.select(this).style("fill", COLOR_HOVER);
                    // })
                    // .on("mouseout", function(d) {
                    // d3.select(this).style("fill", COLOR_HIGHLIGHT);
                    // d3.select(this).style("fill", function(d) {
                    //     if ($scope.detectedObjects[d.objectId].rootCauseChain) return COLOR_HIGHLIGHT;
                    //     return COLOR_DEFAULT;
                    // });
                    // });
                    .call(angularCompile);

                // Node icon background color dynamic: icon mask, color
                node.select(".node-icon")
                    .attr("mask", function(d) {
                        return "url(#mask_" + $scope.detectedObjects[d.objectId].objectType + ")";
                    })
                    .style("fill", COLOR_HIGHLIGHT)
                    // .style("fill", function(d) {
                    //     if ($scope.detectedObjects[d.objectId].rootCauseChain) return COLOR_HIGHLIGHT;
                    //     return COLOR_DEFAULT;
                    // })
                    .on('contextmenu', function(d, i) { /* right click function */ });

                // Node expand icon background color
                // nodeEnter.append("rect")
                //     .attr("class", "node-expand-icon")
                //     .attr("x", "0")
                //     .attr("y", "0")
                //     .attr("width", "24")
                //     .attr("height", "24")
                //     .style("fill", "#000000")
                //     .attr("mask", "url(#mask_expand)")
                //     .attr("transform", "translate(10, -12)")
                //     .on("click", function(d) {
                //         expandNode(d);
                //     })
                //     .on("mouseover", function(d) {
                //         d3.select(this).style("fill", COLOR_HOVER);
                //     })
                //     .on("mouseout", function(d) {
                //         d3.select(this).style("fill", COLOR_HIGHLIGHT);
                //         // d3.select(this).style("fill", function(d) {
                //         //     if ($scope.detectedObjects[d.objectId].rootCauseChain) return COLOR_HIGHLIGHT;
                //         //     return COLOR_DEFAULT;
                //         // });
                //     });

                // Dynamic: node expand icon displaying and color
                // node.select(".node-expand-icon")
                //     .attr("opacity", function(d) {
                //         if (isNodeExpandable(d)) return "1";
                //         else return "0";
                //     })
                //     .style("fill", COLOR_HIGHLIGHT);
                //     // .style("fill", function(d) {
                //     //     if ($scope.detectedObjects[d.objectId].rootCauseChain) return COLOR_HIGHLIGHT;
                //     //     return COLOR_DEFAULT;
                //     // });

                // Node name
                nodeEnter.append("text")
                    .attr("x", "35")
                    .attr("y", "3")
                    .attr('class', 'node-name')
                    .text(function(d) {
                        var name = $scope.detectedObjects[d.objectId].objectName;
                        if (name.length > 15) return name.substr(0, 15) + "...";
                        return name;
                    })
                    .style("fill-opacity", 0);

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    })
                    .each("end", transitionEndCallback);

                // Fade the text in
                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                nodeUpdate.select(".node-icon")
                    .style("opacity", 1);


                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 0);

                nodeExit.select("text")
                    .style("fill-opacity", 0);

                nodeExit.select(".node-icon")
                    .style("opacity", 0);


                // Update the links
                var link = svgGroup.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    });

                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d) {
                        var o = {
                            x: source.x0,
                            y: source.y0
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .style("opacity", "0")
                    .filter(function(d, i) {
                        if (!d.source.objectId) return d;
                        return null;
                    })
                    .remove();

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal)
                    .style("opacity", "1");

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {
                            x: source.x,
                            y: source.y
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .style("opacity", "0")
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

                // Update full mindmap size
                var levelWidth = [1];
                var levelHeight = 0;
                var childCount = function(level, n) {
                    if (n.depth > levelHeight) levelHeight = n.depth;
                    if (n.children && n.children.length > 0) {
                        if (levelWidth.length <= level + 1) levelWidth.push(0);

                        levelWidth[level + 1] += n.children.length;
                        n.children.forEach(function(d) {
                            childCount(level + 1, d);
                        });
                    }
                };
                childCount(0, root);
                //var newHeight = d3.max(levelWidth) * LEVEL_HEIGHT; // pixels per line
                //tree = tree.size([newHeight, viewerWidth]);
                $scope.fullSize[0] = levelHeight * LEVEL_WIDTH;
            }

            // Append a group which holds all nodes and which the zoom Listener can act upon.
            var svgGroup = baseSvg.append("g").attr("class", "svgGroup");

            // Define the root
            root = treeData;
            root.x0 = viewerHeight / 2;
            root.y0 = 0;

            // Layout the tree initially and center on the root node.
            // setDefaultMindmapData();
            update(root);
            $scope.transformToDisplayFullView(root);
            // collapseNodeRecursive(root);
            // initialPosition(root.children[0]);

            // $scope.$watch("updateSignal", function() {
            //     for (var x = 0; x < $scope.updateQueue.length; x++) {
            //         if ($scope.updateQueue[x].parent && $scope.updateQueue[x].parent.objectId) {
            //             setChildrenInRootCauseChain($scope.updateQueue[x].parent);
            //         }
            //         update($scope.updateQueue[x]);
            //         $scope.updateQueue.splice(x--, 1);
            //     }
            //     $scope.updateContents();
            // }, true);
        }]
    };
});

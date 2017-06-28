/*Copyright (c) 2013-2016, Rob Schmuecker
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 * The name Rob Schmuecker may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
 INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/


function renderTree(error, treeData, req) {

    var COLOR_DEFAULT = "#050505";
    var COLOR_HIGHLIGHT = "#d64541";
    var COLOR_HOVER = "#26a3d3";
    var COLOR_SUSPICIOUS = "#f7ca18";

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;

    // size of the diagram
    var viewerWidth = 1100;
    var viewerHeight =2000;

    var tree = d3.layout.tree()
        .size([72, 240]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    // A recursive helper function for performing some setup by walking through all nodes

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

    // Call visit function to establish maxLabelLength
    visit(treeData, function (d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function (d) {
        if (d.pid == req.pid && d.children) {
            d.children.forEach(collapse)
        }
        if (d.children && d.children.length > 2 && d.children[0].sub_type != d.children[1].sub_type) {
            d.children = d.children.filter(function (value) {
                result = showFunction(value.event_type, value.sub_type);
                console.info(result);
                return result;
            })
        }

        return d.children && d.children.length > 0 ? d.children : null;
    });

    function showFunction(type, sub_type) {

        if (type == 1 && (sub_type == 3 || sub_type == 4)) {
            return true;
        } else if (type == 2) {
            return true;
        } else if (type == 3) {
            return true;

        } else if (type == 4) {
            return true;

        } else if (type == 5 && (sub_type == 1 || sub_type == 8 || sub_type == 7)) {
            return true;
        } else {
            return false;
        }

    }


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function (a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }

    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function () {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.5, 3]).on("zoom", zoom);

    function initiateDrag(d, domNode) {
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        svgGroup.selectAll("g.node").sort(function (a, b) { // select the parent and sort the path's
            if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            nodePaths = svgGroup.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = svgGroup.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id;
                }).filter(function (d, i) {
                    if (d.id == draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        }

        // remove parent link
        parentLink = tree.links(tree.nodes(draggingNode.parent));
        svgGroup.selectAll('path.link').filter(function (d, i) {
            if (d.target.id == draggingNode.id) {
                return true;
            }
            return false;
        }).remove();

        dragStarted = null;
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);



    var OBJECT_DEF = {"type": ['file', 'user']}
    // Create icon masks
    //var svgDef = baseSvg.append("defs");
    var iconTypes = ["collapse", "file", "user", "process", "ip", "service", "registry"];
    var mapping = {
        "1": "file",
        "2": "process",
        "3": "ip",
        "4": "service",
        "5": "registry"
    }

    var unicodeDiscription = {
        "1": "文件",
        "2": "进程",
        "3": "ip",
        "4": "服务",
        "5": "注册表"
    }
//TODO for the discription function
    function getDescription(d) {
        var foo = {}
        foo.name = d.name;
        foo.pid = d.pid;
        foo.times = 1;


        if (d.times)
            foo.times = d.times;

        if (d.begin_time)
            foo.time = d.begin_time

        var detailArray = [];
        var keyMap = {
            "subject_user_account": "用户名",
            "subject_process": "进程",
            "file_src_path": "源文件路径",
            "file_dst_path": "目标文件",
            "subject_proc_id": "进程ID"
        }
        if (d.raw_log) {
            console.log(d.raw_log)
            for (item in d.raw_log) {
                var pair = d.raw_log[item].split("=");
                var key = pair[0];
                console.info(key + ":" + pair[1]);
                foo[key] = pair[1];
                if (keyMap[key]) {
                    detailArray.push(keyMap[key] + "=" + pair[1])
                } else {
                    detailArray.push(keyMap[key] + "=" + pair[1])
                }

            }
            foo.detail = d.raw_log.filter(function (value) {
                return value.indexOf("version") < 0
                    && value.indexOf("type=") < 0
                    && value.indexOf("status=") < 0
                    && value.indexOf("time=") < 0 && value.length > 0
            }).join(" </br> ")

        } else {
            foo.detail = ""
        }
        foo.type = unicodeDiscription[d.event_type];

        foo.activity = getEventType(d.event_type, d.sub_type)
        console.log(foo)
        return foo

    }

   /* for (var x in OBJECT_DEF.TYPE) {
        iconTypes.push(OBJECT_DEF.TYPE[x]);
    }
    for (var x in iconTypes) {
        svgDef.append("mask")
            .attr("id", "mask_" + iconTypes[x])
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", "20")
            .attr("height", "20")
            .append("image")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", "20")
            .attr("height", "20")
            .attr("xlink:href", 'tree\\mask_' + iconTypes[x] + ".svg");
    }
*/
/*    svgDef.append("mask")
        .attr("id", "mask_expand")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "10")
        .attr("height", "10")
        .append("image")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "10")
        .attr("height", "10")
        .attr("xlink:href", 'tree\\mask_expand.svg')*/

    // Define the drag listeners for drag/drop behaviour of nodes.
    dragListener = d3.behavior.drag()
        .on("dragstart", function (d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on("drag", function (d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            // get coords of mouseEvent relative to svg container to allow for panning
            relCoords = d3.mouse($('svg').get(0));
            if (relCoords[0] < panBoundary) {
                panTimer = true;
                pan(this, 'left');
            } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                panTimer = true;
                pan(this, 'right');
            } else if (relCoords[1] < panBoundary) {
                panTimer = true;
                pan(this, 'up');
            } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                panTimer = true;
                pan(this, 'down');
            } else {
                try {
                    clearTimeout(panTimer);
                } catch (e) {

                }
            }

            d.x0 += d3.event.dy;
            d.y0 += d3.event.dx;
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
            updateTempConnector();
        }).on("dragend", function (d) {
            if (d == root) {
                return;
            }
            domNode = this;
            if (selectedNode) {
                // now remove the element from the parent, and insert it into the new elements children
                var index = draggingNode.parent.children.indexOf(draggingNode);
                if (index > -1) {
                    draggingNode.parent.children.splice(index, 1);
                }
                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                    if (typeof selectedNode.children !== 'undefined') {
                        selectedNode.children.push(draggingNode);
                    } else {
                        selectedNode._children.push(draggingNode);
                    }
                } else {
                    selectedNode.children = [];
                    selectedNode.children.push(draggingNode);
                }
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                //expand(selectedNode);
                //sortTree();
                endDrag();
            } else {
                endDrag();
            }
        });

    function endDrag() {
        selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        if (draggingNode !== null) {
            update(root);
            //centerNode(draggingNode);
            draggingNode = null;
        }
    }

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            //d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function (d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function (d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function () {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.y0,
                    y: selectedNode.x0
                },
                target: {
                    x: draggingNode.y0,
                    y: draggingNode.x0
                }
            }];
        }
        var link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    /*
     function centerNode(source) {
     scale = zoomListener.scale();
     x = -source.y0;
     y = -source.x0;
     x = x * scale + viewerWidth / 10;
     y = y * scale + viewerHeight / 5;
     d3.select('g').transition()
     .duration(duration)
     .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
     zoomListener.scale(scale);
     zoomListener.translate([x, y]);
     }*/
    function centerNode(source) {

        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 3;
        y = y * scale + viewerHeight / 2;

        y =20;

        d3.select('#tree').transition()
            .duration(duration)
            .attr("transform", "translate(" + 200 + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([200, y]);


    }


    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.

    function click(d) {
        d = toggleChildren(d);
        update(d);
        centerNode(d);
    }


    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function (level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function (d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 30; // 25 pixels per line
        console.info("height:"+newHeight)

        viewerHeight = newHeight;


        if (newHeight < 200)
            newHeight = 200



        tree = tree.size([newHeight, viewerWidth]).separation(function (a, b) {
            if (a.children || a._children) {
                return 30
            } else {
                return (a.parent == b.parent ? 20 : 15);
            }

        });//设置相隔节点的

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function (d) {
            d.y = d.depth * 150; //maxLabelLength * 10px
            //d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0+ "," + source.x0 + ")";
            });


        nodeEnter.append("rect")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", "20")
            .attr("height", "20")
            // .style("fill", "#000000")
            .style("opacity", 1)
            .attr("transform", "translate(-10, -10)")
            .attr("mask", function (d) {
                var mask = "url('#mask_%s')".replace("%s", mapping[d.event_type])
                //console.info(mask)
                return mask;
            })
            .on('click', click)
            .style("fill", function (d) {
                return d._children ? "black" : "#5DA9EE";
            })
        ;



        nodeEnter.append("text")
            .attr("x", function (d) {
                return d.children || d._children ? 0 : 15;
            })
            .attr("y", function (d) {
                return d.children || d._children ? 20 : 3;
            })

            .attr('class', 'nodeText')
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "middle" : "start";
            })
            .text(function (d) {
                return d.name = d.name.substring(d.name.lastIndexOf("\\") + 1);
                //console.info("name:" + d.name.substring(d.name.lastIndexOf("\\")));
                //return d.name.substring(d.name.lastIndexOf("\\"))
            })
            //TODO for the mouse over
            .on("mouseover", function (d) {
                console.log(d)
                var info = getDescription(d)
                d3.select(".popover-mindmap").style('top', (d3.event.layerY + 100) + 'px')
                    .style('left', (d3.event.layerX + 0) + 'px');
                d3.select(".popover-mindmap").transition().style("display", "block");
                d3.select(".popover-mindmap").style("width", "600px");
                d3.select(".popover-mindmap").style("max-width", "600px");
                //$(".popover-mindmap").css("width", 500);
                $(".popover-title").html("[" + info.name + "]" + "  详细信息")
                if (info.time) {
                    timesting = timeStamp2String(info.time, "yyyy-MM-dd hh:mm:ss")
                } else {
                    timesting = "NA";
                }
                $("#time").html(timesting)
                $("#name").html(info.name)
                $("#type").html(info.type)
                $("#pid").html(info.pid)
                $("#times").html(info.times)
                $("#subject_user_account").html(info.subject_user_account)
                $("#activity").html(info.activity)
                $("#detail").html(info.detail)
                //getDescription(d);


            })
            .on("mouseout", function (d) {
                d3.select(".popover-mindmap").transition().style("display", "none");
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", "10")
            .attr("height", "10")
            .style("fill", "#000000")
            .attr("mask", "url(#mask_expand)")
            .attr("transform", function (d) {
                if (d._children) {
                    //return "translate(10, -5)"
                    return "translate(30,-5)";
                } else if (d.children) {
                    return "translate(30,5)rotate(180)";
                }
            })
            .style("opacity", function (d) {
                if (d._children || d.children) {
                    return "1";
                } else {
                    return "0"
                }
            })
            //.attr("transform", "translate(10 -12)")
            .attr("mask", function (d) {
                var mask = "url('#mask_expand')"
                //console.info(mask)
                return mask;
            })
            .attr('class', 'nodeCircle')
            .attr("class", "node-expand-icon")
            .on('click', click)
        //.style("fill", COLOR_DEFAULT)

        ;

        node.select(".node-expand-icon")
            .attr("opacity", function (d) {
                if (d.children || d._children)
                    return "1";
                else
                    return "0";
            })
            .style("fill", function (d) {
                return COLOR_DEFAULT;
            });


        // Change the circle fill depending on whether it has children and is collapsed
        node.select("rect.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function (d) {
                return d._children ? COLOR_HIGHLIGHT : COLOR_DEFAULT;
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        nodeUpdate.select(".node-expand-icon")
            .attr("opacity", function (d) {
                if (d.children || d._children)
                    return "1";
                else
                    return "0";
            })
            .attr("transform", function (d) {
                if (d._children) {
                    //return "translate(10, -6)"
                    return "translate(20,-5)";
                } else if (d.children) {
                    return "translate(30,5)rotate(180)";
                }
            })
            .style("fill", function (d) {
                return COLOR_DEFAULT;
            });

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .style("fill", "none")
            .style("stroke", "#ccc")
            .style("stroke-width", "1.5px")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g").attr("id", "tree")

    // Define the root
    root = treeData;

    root.x0 = viewerHeight / 2;
    root.y0 = 200;

    //root.children.forEach(collapse);
    // Layout the tree initially and center on the root node.
    update(root);
    zoomListener.scale(1);
    centerNode(root);
    var temp = root;

    var filteredNode;

    function filter(filtervalue) {
        var visitNode = function (level, dataNode) {

            if (dataNode.children && dataNode.children.length > 0) {
                console.info("过滤前：" + dataNode.name);
                console.info(dataNode);

                //find out the
                if ((!dataNode.raw_log || dataNode.row_log.length == 0)) {
                    if (dataNode.children_old) {
                        dataNode.children = dataNode.children_old;
                    } else {
                        dataNode.children_old = dataNode.children;
                    }
                    dataNode.children = dataNode.children.filter(function (value) {
                        return value._children || value.children || value.name.indexOf(filtervalue) > -1;
                    })

                    if (dataNode.children.length < dataNode.children_old.length) {
                        filteredNode = dataNode;
                    }

                    if (dataNode.children.length == 0) {
                        dataNode.children = dataNode.children_old;
                    }
                    console.info("过滤后：" + dataNode.name);
                    console.info(dataNode);
                }

                dataNode.children.forEach(function (d) {
                    visitNode(level + 1, d);
                });
            } else if (dataNode.children) {

            }
        };
        visitNode(0, root);
    }

    $('#filter').bind('input propertychange', function () {
        $('#content').html($(this).val().length + ' characters');
        if (($(this).val().length >= 0)) {
            root = temp;
            filter($(this).val())
            update(root)
            centerNode(filteredNode)
            /*
             $.ajax({
             method: "POST",
             url: "hard.json",
             data: JSON.stringify({
             "timestamp": "1493098320",
             "pid": "2308",
             "device_guid": "diclient",
             "processname": "calc.exe"
             }),
             }).success(function (data) {
             var error = "";
             root = data;
             update2(data)
             centerNode(root)
             }).done(function (msg) {
             //alert( "Data Saved: " + msg );
             });
             */

        }


    });

//TODO
    var scale = zoomListener.scale();
    d3.select("#plus").on("click", function () {
        scale = zoomListener.scale()
        scale += 0.1
        zoomListener.scale(scale)
        centerNode(root)
    })

    d3.select("#minus").on("click", function () {
        scale = zoomListener.scale()
        scale -= 0.1
        zoomListener.scale(scale)
        centerNode(root)

    })

    var getEventType = function (eventType, subType) {
        data = {
            1: {
                1: "创建文件",
                2: "打开文件",
                3: "读文件",
                4: "写文件",
                5: "删除文件",
                6: "重命名文件",
                7: "查询文件信息",
                8: "修改文件信息",
                9: "关闭文件"
            },
            2: {
                1: "进程创建",
                2: "进程加载",
                3: "进程终止"
            },
            3: {
                1: "Web",
                2: "邮件",
                3: "文件传输",
                4: "其他应用程序"
            },
            4: {
                1: "系统登录",
                2: "挂载",
                3: "取消挂载",
                4: "网络连接",
                5: "断开网络连接",
                6: "修改密码"
            },
            5: {
                1: "注册表创建",
                2: "注册表打开",
                3: "注册表删除",
                4: "注册表查询",
                5: "注册表重命名",
                6: "配置key查询value",
                7: "配置key设置value",
                8: "配置key删除value",
                9: "配置key关闭"
            }
        };


        var res;
        if (eventType in data && subType in data[eventType]) {
            res = data[eventType][subType];
        }
        else if (eventType = 2 && !subType) {
            res = "进程创建";
        } else {
            res = "unknown";
        }
        return res;
    };


}
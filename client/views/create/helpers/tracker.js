App.tracker = {
    added: function (id, fields) {
//        var newNode = App.map.getNodeDataWithNodeId(id);
//        if (newNode)
//            return;
//        newNode = fields;
//        newNode._id = id;
//
//        var parent = App.map.getNodeDataWithNodeId(newNode.parentId);
//          App.nodeStore[id] = newNode;
//        App.map.addNodeToUI(parent, newNode);
//        App.nodeSelector.setPrevDepth(newNode.depth);
    },

   changed: function (id, fields) {
        var updatedNode = App.map.getNodeDataWithNodeId(id);
        if (!updatedNode) return;
        if (fields.hasOwnProperty('name')) {
            updatedNode.name = fields.name;
            App.chart.update();
            var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
            // redraw gray box
            if (selectedNode && selectedNode._id === id) {
                setTimeout(function () {
                    App.selectNode(selectedNode);
                }, 10);
            }
        } else if (fields.hasOwnProperty('childSubTree') || fields.hasOwnProperty('left') || fields.hasOwnProperty('right')){
            var parent = App.map.getNodeDataWithNodeId(id),
                isCollapsed = parent.isCollapsed;
            var key = Object.keys(fields)[0],
                subTree = App.Node.getSubTree(parent, key),
                childIds = fields[key],
                selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected"),
                newlyAddedId = App.getNewlyAddedNodeId(parent, fields),
                newSubTree = childIds.map(
                    function(childid){
                        return subTree.find(
                            function(node){
                                return node._id === childid;
                            });
                    });

            if(App.Node.isRoot(parent)){
                if(App.checkRepositionUpdateOnRoot(parent, key, newlyAddedId)) {
                }
            }

            if(newlyAddedId == null){
                App.Node.setSubTree(parent, newSubTree, key);
                App.chart.update();
                if(App.tracker.repaintNodeId) {
                    var node = d3.selectAll(".node")[0].find(
                        function(child){
                            return child.__data__._id == App.tracker.repaintNodeId;
                        });
                    if(node) {
                        changeCurrentNodeClass(node);
                    }
                    App.tracker.repaintNodeId = null;
                    App.chart.update();
                }

            } else {

                var flag = false;
                App.nodeStore.forEach(function(e){
                    if(e._id == newlyAddedId)
                        flag = true;
                });

                if(!flag && parent){
                    var dir = fields.hasOwnProperty("left")?"left":(fields.hasOwnProperty("right")?"right":App.getDirection(parent))
                    siblings = App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree;

                    var tempFields = App.Node("",dir,parent,null) ? App.Node("",dir,parent,null) : new Object(new App.Node("",dir,parent,null));
                    App.tracker.added(newlyAddedId, tempFields);
                }

                var movedNode = App.map.getNodeDataWithNodeId(newlyAddedId);
                subTree.splice(childIds.indexOf(newlyAddedId),0,movedNode);
                newlyAddedId = null;
            }
        }
        else if(fields.hasOwnProperty('parentId')) {
            if(!fields.parentId) return;
            App.tracker.repaintNodeId = id;
            if(fields.parentId != "None") {
                var selectedNode = App.map.getNodeDataWithNodeId(id),
                    newParent = App.map.getNodeDataWithNodeId(fields.parentId);

                selectedNode.parent = newParent;
                selectedNode.parentId = newParent._id;
            }
        }
        App.chart.update();

        if((d3.select(".selected").length == 1) && (d3.select(".selected")[0][0] == null)){
            var nodeToBeSelected = d3.selectAll('.node')[0].find(function(_) {
                                        return _.__data__._id == id;
                                    });
            d3.select(nodeToBeSelected).classed("selected", true);
        }

    }
};

var changeCurrentNodeClass = function(node){
    var tempD3Array = d3.select('thisIsANonExistentTag');
    tempD3Array[0].pop();
    tempD3Array[0].push(node);
    App.removeAllLevelClass(tempD3Array);
    App.applyLevelClass(tempD3Array, node.__data__.depth);
    App.applyClassToSubTree(node.__data__, null, App.removeAllLevelClass);
    App.applyClassToSubTree(node.__data__, null, App.applyLevelClass);

    tempD3Array[0].pop();
    App.resetPathClassForCurrentNode(null, node.__data__);
};
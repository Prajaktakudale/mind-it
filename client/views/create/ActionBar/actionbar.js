Template.ActionBar.helpers({
//var json_array = [ ];
    userimages: function(){
        var usersAvailable= Meteor.users.find().fetch();
        var Srcs= usersAvailable.map(function(x){
                var user_object;

        if(x.status.online && App.currentMap == x.mindmap_id)
          {
        //console.log("status",x.status.online);
//        user_object.name=x.services.google.name;
//        user_object.picture=x.services.google.picture;
            return { name: x.services.google.name, picture: x.services.google.picture};
          }
        });
        console.log("before filter: ", Srcs);
        var imageSrcs=Srcs.filter(function(y)
        {
            if (y === undefined || y === null) {
                 // do something
            }
            else
            return y;
        });
        console.log("RETURNED: ", imageSrcs);
        return imageSrcs;
    }
});
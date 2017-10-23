var labelTranslation = {
    "People\\OrganizationMemberAdded": "joined on",
    "People\\OrganizationMemberRoleChanged": "changed role to",
    "People\\OrganizationMemberRemoved": "left on"
};

angular.module('app.collaboration').filter('historyNameToLabel', function() {
        return function(name, role) {
            var toReturn = labelTranslation[name];
            if(name === "People\\OrganizationMemberRoleChanged"){
                toReturn = toReturn+" "+role+" on";
            }
            return toReturn;
        };
    });
({
	doInit: function (cmp, event, helper) {

    },

    onAgentMessage : function(cmp, event, helper) { 
        helper.saveLastMessage(cmp, event, true);
    },
    
    onCustomerMessage : function(cmp, event, helper) {
        helper.saveLastMessage(cmp, event, false);
    }
})
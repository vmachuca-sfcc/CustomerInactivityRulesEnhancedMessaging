({
    doInit: function (cmp, event, helper) {
        cmp.set("v.timeToSendWarningId", helper.createWaringTimer(cmp));
        cmp.set("v.timeToEndChatId", helper.createEndChatTimer(cmp));
    },

    onAgentMessage : function(cmp, event, helper) { 
        if(helper.IsSkipScheduleTimer(cmp)) return;
        helper.saveLastMessage(cmp, event, true);
        helper.verifyTimers(cmp, helper, true);
    },
    
    onCustomerMessage : function(cmp, event, helper) {
        helper.saveLastMessage(cmp, event, false);
        helper.verifyTimers(cmp, helper, false);
    }
})

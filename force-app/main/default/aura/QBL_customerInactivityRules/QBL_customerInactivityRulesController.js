({
    doInit: function (cmp, event, helper) {
        cmp.set("v.timeToSendWarningId", helper.createWaringTimer(cmp));
        cmp.set("v.timeToEndChatId", helper.createEndChatTimer(cmp));
        helper.saveTab(cmp);
    },

    onAgentMessage : function(cmp, event, helper) { 
        if(helper.IsSkipScheduleTimer(cmp, event)) return;
        helper.saveLastMessage(cmp, event, true);
        helper.verifyTimers(cmp, event, true);
    },
    
    onCustomerMessage : function(cmp, event, helper) {
        helper.saveLastMessage(cmp, event, false);
        helper.verifyTimers(cmp, event, false);
    }
})

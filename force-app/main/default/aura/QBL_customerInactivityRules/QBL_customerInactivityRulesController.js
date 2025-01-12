({
    doInit: function (cmp, event, helper) {
        cmp.set("v.timeToSendWarningId", helper.createWaringTimer(cmp));
        cmp.set("v.timeToEndChatId", helper.createEndChatTimer(cmp));
    },

    onAgentMessage : function(cmp, event, helper) { 
        if(helper.IsSkipScheduleTimer(cmp)) return;
        helper.saveLastMessage(cmp, event, true);

        const timerId = cmp.get("v.timeToSendWarningId");
        if (!timerId) return;
        clearTimeout(timerId);
        cmp.set("v.timeToSendWarningId", helper.createWaringTimer(cmp));
    },
    
    onCustomerMessage : function(cmp, event, helper) {
        helper.saveLastMessage(cmp, event, false);

        const timerId = cmp.get("v.timeToEndChatId");
        if (!timerId) return;
        clearTimeout(timerId);
        cmp.set("v.timeToEndChatId", helper.createEndChatTimer(cmp));
    },
})

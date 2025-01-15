({
    createWaringTimer: function(cmp) {
        const ctx = this;
        const time = cmp.get('v.timeToSendWarning');
        if (!time) return null;
        return window.setTimeout(
            $A.getCallback(function() {
                ctx.sendMessage(cmp, cmp.get('v.warningMessage'));
            }), time * 1000
        );
    },

    createEndChatTimer: function(cmp) {
        const ctx = this;
        const time = cmp.get('v.timeToEndChat');
        if (!time) return null;
        return window.setTimeout(
            $A.getCallback(function() {
                ctx.endChat(cmp, ctx);
            }), time * 1000
        );
    },

    endChat: function (cmp, ctx) {
        const conversationKit = cmp.find("conversationKit");
        const recordId = cmp.get("v.recordId");
        conversationKit.endChat({
            recordId: recordId
        }).then(result => {
            if (!result) return;
            ctx.saveCloseLog(cmp);
            ctx.closeTab(cmp);
            console.log("Successfully ended chat");
        })
        .catch(e => {
            console.log(e);
        });
    },

    sendMessage: function (cmp, msg) {
        const conversationKit = cmp.find("conversationKit");
        const recordId = cmp.get("v.recordId");
        conversationKit.sendMessage({
            recordId: recordId,
            message: { text: msg }
        });
    },

    verifyTimers: function(cmp, event, isAgent) {
        const timerWarningId = cmp.get("v.timeToSendWarningId");
        const timerEndChatId = cmp.get("v.timeToEndChatId");
        if (timerWarningId) {
            clearTimeout(timerWarningId);
            if(isAgent) cmp.set("v.timeToSendWarningId", this.createWaringTimer(cmp));
        }
        if (timerEndChatId) {
            clearTimeout(timerEndChatId);
            if(isAgent) cmp.set("v.timeToEndChatId", this.createEndChatTimer(cmp));
        }
    },

    saveTab: function(cmp) {
        const workspaceAPI = cmp.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            const tabId = response.tabId;
            cmp.set("v.tabId", tabId);
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    closeTab: function(cmp) {
        const workspaceAPI = cmp.find("workspace");
        const tabId = cmp.get("v.tabId");
        workspaceAPI.closeTab({ tabId: tabId });
    },

    IsSkipScheduleTimer: function(cmp, event) {
        return event.getParam('content') == cmp.get('v.warningMessage');
    },

    saveLastMessage: function(cmp, event, isAgent) {
        let action = cmp.get(isAgent ? "c.saveLastAgentMessage" : "c.saveLastCustomerMessage");
        action.setParams({ 
            recordId: event.getParam('recordId'),
            content: event.getParam('content'),
            timestamp: event.getParam('timestamp')
        });
        $A.enqueueAction(action);
    },

    saveCloseLog: function(cmp) {
        let action = cmp.get("c.saveCloseLog");
        action.setParams({ 
            recordId: cmp.get('v.recordId')
        });
        $A.enqueueAction(action);
    }
})

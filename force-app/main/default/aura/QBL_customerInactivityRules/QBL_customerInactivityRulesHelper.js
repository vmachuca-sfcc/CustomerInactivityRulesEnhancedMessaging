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
            ctx.closeFocusedTab(cmp);
            console.log("Successfully ended chat");
        })
        .catch(e => {
            console.log(e);
        });
    },

    sendMessage: function (cmp, msg) {
        const conversationKit = cmp.find("conversationKit");
        const recordId = cmp.get("v.recordId");
        cmp.set("v.skipScheduleTimer", true);
        conversationKit.sendMessage({
            recordId: recordId,
            message: { text: msg }
        });
    },

    closeFocusedTab: function(cmp) {
        const workspaceAPI = cmp.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            const focusedTabId = response.tabId;
            workspaceAPI.closeTab({ tabId: focusedTabId });
        })
        .catch(function(error) {
            console.log(error);
        });
    },

    IsSkipScheduleTimer: function(cmp) {
        const isSkip = cmp.get("v.skipScheduleTimer");
        cmp.set("v.skipScheduleTimer", false);
        return isSkip;
    },

    saveLastMessage: function(cmp, event, isAgent) {
        let action = cmp.get(isAgent ? "c.saveLastAgentMessage" : "c.saveLastCustomerMessage");
        action.setParams({ 
            recordId: event.getParam('recordId'),
            content: event.getParam('content'),
            timestamp: event.getParam('timestamp')
        });
        $A.enqueueAction(action);
    }
})

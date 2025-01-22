({
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
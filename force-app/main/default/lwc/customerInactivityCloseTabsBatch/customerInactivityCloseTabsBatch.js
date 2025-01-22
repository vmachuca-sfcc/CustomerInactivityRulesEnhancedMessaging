import { LightningElement, api, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { IsConsoleNavigation, getAllTabInfo, closeTab } from 'lightning/platformWorkspaceApi';

import userId from '@salesforce/user/Id';
import saveAutoClosedTabsLog from '@salesforce/apex/CustomerInactivityRulesController.saveAutoClosedTabsLog';
import getMessagingSessionTabsToBeClosed from '@salesforce/apex/CustomerInactivityRulesController.getMessagingSessionTabsToBeClosed';
import MessagingSessionCloseAllTabs from "@salesforce/messageChannel/MessagingSessionCloseAllTabs__c";

export default class CustomerInactivityCloseTabsBatch extends LightningElement {
    @api recordId;
    @api batchInterval;
    @api minInactivityTime;
    currentUserId = userId;
    intervalId;

    @wire(IsConsoleNavigation) 
    isConsoleNavigation;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        if (!this.isConsoleNavigation) {
            return;
        }
        this.intervalId = setInterval(() => {
            this.executeBatch(false);
        }, this.batchInterval * 60000);

        this.subscription = subscribe(
            this.messageContext,
            MessagingSessionCloseAllTabs,
            () => this.executeBatch(true)
        );
    }

    disconnectedCallback() {
        clearInterval(this.intervalId);
    }

    async executeBatch(closeAll) {
        const activeTabsToClose = await getMessagingSessionTabsToBeClosed({
            ownerId: this.currentUserId,
            minInactivityTime: this.minInactivityTime
        });
        this.closeTabs(activeTabsToClose, closeAll);
    }

    async closeTabs(activeTabsToClose, closeAll) {
        const recordIdsAutoClosed = [];
        const tabsInfo = await getAllTabInfo();
        const toolKit = this.refs.lwcToolKitApi;

        tabsInfo.forEach(tab => {
            if(activeTabsToClose.includes(tab.recordId)) {
                toolKit.endConversation(tab.recordId);
                recordIdsAutoClosed.push(tab.recordId);
                closeTab(tab.tabId);
            } else if(closeAll) {
                closeTab(tab.tabId);
            }    
        });
        if(recordIdsAutoClosed && !closeAll) {
            await saveAutoClosedTabsLog({ recordIds: recordIdsAutoClosed });
        }
    }
}
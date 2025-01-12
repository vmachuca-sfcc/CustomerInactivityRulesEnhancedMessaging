import { LightningElement, api, wire } from 'lwc';
import { IsConsoleNavigation, getAllTabInfo, closeTab } from 'lightning/platformWorkspaceApi';

import userId from '@salesforce/user/Id';
import isCurrentAgentOnline from '@salesforce/apex/CustomerInactivityRulesController.isCurrentAgentOnline';
import getMessagingSessionTabsToBeClosed from '@salesforce/apex/CustomerInactivityRulesController.getMessagingSessionTabsToBeClosed';

export default class CustomerInactivityCloseTabsBatch extends LightningElement {
    @api recordId;
    @api batchInterval;
    @api minInactivityTime;
    currentUserId = userId;
    intervalId;

    @wire(IsConsoleNavigation) isConsoleNavigation;

    connectedCallback() {
        if (!this.isConsoleNavigation) {
            return;
        }
        /*
        isCurrentAgentOnline({ userId: this.currentUserId }).then(isOnline => {
            if(!isOnline) return;
            this.intervalId = setInterval(() => {
                this.executeBatch();
            }, this.batchInterval + 60000);
        });
        */
        this.intervalId = setInterval(() => {
            this.executeBatch();
        }, this.batchInterval * 60000);
    }

    disconnectedCallback() {
        clearInterval(this.intervalId);
    }

    async executeBatch() {
        const tabsToBeClosed = await getMessagingSessionTabsToBeClosed({
            ownerId: this.currentUserId,
            minInactivityTime: this.minInactivityTime
        });
        if (tabsToBeClosed) {
            this.closeTabs(tabsToBeClosed);
        }
    }

    async closeTabs(tabsToBeClosed) {
        const tabsInfo = await getAllTabInfo();
        tabsInfo.forEach(tab => {
            if(tab.iconAlt == "MessagingSession" && tabsToBeClosed.includes(tab.recordId)) {
                closeTab(tab.tabId);
            }
        });
    }
}
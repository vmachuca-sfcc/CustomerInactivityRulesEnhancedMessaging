import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { publish, MessageContext } from 'lightning/messageService';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import OPPORTUNITY_STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';
import MessagingSessionCloseAllTabs from "@salesforce/messageChannel/MessagingSessionCloseAllTabs__c";

export default class MessagingSessionOpportunityStagingProgress extends LightningElement {
    @api recordId;
    opportunityId;
    currentStage;
    stageOptions = [];
    recordTypeId;

    @wire(MessageContext)
    messageContext;

    @wire(getRecord, { recordId: '$recordId', fields: ['MessagingSession.OpportunityId'] })
    messagingSession({ error, data }) {
        if (!data) return;
        this.opportunityId = data.fields.OpportunityId.value;
    }

    @wire(getRecord, { recordId: '$opportunityId', fields: ['Opportunity.StageName', 'Opportunity.RecordTypeId'] })
    opportunity({ error, data }) {
        if (!data) return;
        this.currentStage = data.fields.StageName.value;
        this.recordTypeId = data.fields.RecordTypeId.value;
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: OPPORTUNITY_STAGE_FIELD })
    picklistValues({ error, data }) {
        if (!data) return;
        this.stageOptions = data.values;
    }

    closeTabsClick() {  
        publish(this.messageContext, MessagingSessionCloseAllTabs, { closeAll: true });
    }
}
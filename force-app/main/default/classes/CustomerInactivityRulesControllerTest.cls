@isTest
public class CustomerInactivityRulesControllerTest {
    
    @isTest
    static void testGetMessagingSessionTabsToBeClosed() {
        String ownerId = UserInfo.getUserId();
        Integer minInactivityTime = 25;

        Test.startTest();
        List<String> sessionIds = CustomerInactivityRulesController.getMessagingSessionTabsToBeClosed(ownerId, minInactivityTime);
        Test.stopTest();

        System.assertEquals(1, sessionIds.size(), 'Only one session should exceed inactivity time');
    }

    @isTest
    static void testSaveLastAgentMessage() {
        String sessionId = [SELECT Id FROM MessagingSession LIMIT 1].Id;
        String content = 'Agent message';
        Datetime timestamp = Datetime.now();

        Test.startTest();
        CustomerInactivityRulesController.saveLastAgentMessage(sessionId, content, timestamp);
        Test.stopTest();

        MessagingSession updatedSession = [SELECT LastAgentMessage__c, LastAgentMessageDate__c FROM MessagingSession WHERE Id = :sessionId];
        System.assertEquals(content, updatedSession.LastAgentMessage__c, 'LastAgentMessage__c should be updated.');
        System.assertEquals(timestamp, updatedSession.LastAgentMessageDate__c, 'LastAgentMessageDate__c should be updated.');
    }

    @isTest
    static void testSaveLastCustomerMessage() {
        String sessionId = [SELECT Id FROM MessagingSession LIMIT 1].Id;
        String content = 'Customer message';
        Datetime timestamp = Datetime.now();

        Test.startTest();
        CustomerInactivityRulesController.saveLastCustomerMessage(sessionId, content, timestamp);
        Test.stopTest();

        MessagingSession updatedSession = [SELECT LastCustomerMessage__c, LastCustomerMessageDate__c FROM MessagingSession WHERE Id = :sessionId];
        System.assertEquals(content, updatedSession.LastCustomerMessage__c, 'LastCustomerMessage__c should be updated.');
        System.assertEquals(timestamp, updatedSession.LastCustomerMessageDate__c, 'LastCustomerMessageDate__c should be updated.');
    }
    
    @testSetup
    static void setupTestData() {
        User thisUser = [
            SELECT Id 
            FROM User 
            WHERE Id = :UserInfo.getUserId()
        ];  
        System.runAs(thisUser) {
            MessagingChannel mc = new MessagingChannel();
            mc.MasterLabel = 'TestChannel';
            mc.DeveloperName = 'TestChannel';
            mc.IsActive = true;
            mc.MessageType = 'Text'; 
            mc.MessagingPlatformKey = 'TestChannel';
            insert mc;
             
            MessagingEndUser mu = new MessagingEndUser();
            mu.Name = 'Fake';
            mu.MessageType = 'EmbeddedMessaging';
            mu.MessagingPlatformKey = 'FakeKey';
            mu.MessagingChannelId = mc.Id;
            insert mu;
            
            List<MessagingSession> sessions = new List<MessagingSession>();
            sessions.add(new MessagingSession(
                OwnerId = thisUser.Id,
                Status = 'Active',
                MessagingEndUserId = mu.Id,
                MessagingChannelId = mc.Id,
                LastCustomerMessageDate__c = Datetime.now().addMinutes(-30),
                LastAgentMessageDate__c = Datetime.now().addMinutes(-20)
            ));
            sessions.add(new MessagingSession(
                OwnerId = thisUser.Id,
                Status = 'Active',
                MessagingEndUserId = mu.Id,
                MessagingChannelId = mc.Id,
                LastCustomerMessageDate__c = Datetime.now().addMinutes(-50),
                LastAgentMessageDate__c = Datetime.now().addMinutes(-40)
            ));
            sessions.add(new MessagingSession(
                OwnerId = thisUser.Id,
                Status = 'Active',
                MessagingEndUserId = mu.Id,
                MessagingChannelId = mc.Id,
                LastCustomerMessageDate__c = null,
                LastAgentMessageDate__c = null
            ));
            insert sessions;
        }
    }
}
public without sharing class CustomerInactivityRulesController {

    @AuraEnabled
    public static Boolean isCurrentAgentOnline(String userId) {
        List<UserServicePresence> result = [
             SELECT IsCurrentState FROM UserServicePresence 
             WHERE IsCurrentState = true AND Userid = :userId LIMIT 1
        ];
        return result.size() > 0;        
    }
  		
    @AuraEnabled
    public static List<String> getMessagingSessionTabsToBeClosed(String ownerId, Integer minInactivityTime) {
        List<String> sessionIds = new List<String>();
                
        for(MessagingSession session : [
            SELECT Id, Status, LastCustomerMessageDate__c, LastAgentMessageDate__c
            FROM MessagingSession 
            WHERE OwnerId = :ownerId AND Status IN ('Active', 'Inactive') AND LastModifiedDate = TODAY]) {
            
   			DateTime timestamp = getTimestamp(session);
            Boolean limitExceeded = isTimestampGreaterThanLimit(timestamp, minInactivityTime);
   			
            if(limitExceeded) {
                sessionIds.Add(session.Id);
            }          
        }
  		return sessionIds; 
    }

    @AuraEnabled
    public static void saveLastAgentMessage(String recordId, String content, DateTime timestamp) {
        saveLastMessage(true, recordId, content, timestamp);
    }
    
    @AuraEnabled
    public static void saveLastCustomerMessage(String recordId, String content, DateTime timestamp) {
        saveLastMessage(false, recordId, content, timestamp);
    }  
    
    private static void saveLastMessage(Boolean isAgent, String recordId, String content, DateTime timestamp) {
        MessagingSession session = [SELECT Id FROM MessagingSession WHERE Id = :recordId LIMIT 1];
        if(isAgent) {
            session.LastAgentMessage__c = content;
            session.LastAgentMessageDate__c = timestamp;
        } else {
            session.LastCustomerMessage__c = content;
            session.LastCustomerMessageDate__c = timestamp;          
        }
        update session;
    }
    
    private static Boolean isTimestampGreaterThanLimit(Datetime timestamp, Integer minInactivityTime) {
        if(timestamp == null) return false;
        Long differenceInMillis = Datetime.now().getTime() - timestamp.getTime();
        Long differenceInMinutes = differenceInMillis / 60000;
        return differenceInMinutes >= minInactivityTime;
    }
    
    private static DateTime getTimestamp(MessagingSession session) {
        if (session.LastCustomerMessageDate__c != null && session.LastAgentMessageDate__c != null) {
        	return session.LastCustomerMessageDate__c > session.LastAgentMessageDate__c 
                ? session.LastCustomerMessageDate__c 
                : session.LastAgentMessageDate__c;
        } else if (session.LastCustomerMessageDate__c != null) {
            return session.LastCustomerMessageDate__c;
        } else if (session.LastAgentMessageDate__c != null) {
            return session.LastAgentMessageDate__c;
        }
        return null;
    } 
}
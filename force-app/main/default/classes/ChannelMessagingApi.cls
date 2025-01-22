public class ChannelMessagingApi {
    
    public static String getToken() {
        String organizationId = UserInfo.getOrganizationId();
        String domain = DomainParser.parse(URL.getOrgDomainURL().toExternalForm()).getMyDomainName();
        
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setEndpoint('https://' + domain + '.my.salesforce-scrt.com/agent/v1/authenticate');
        
        Map<String, String> data = new Map<String, String>();
        data.put('sfdcSessionId', UserInfo.getSessionId());
        data.put('organizationId', organizationId.substring(0, organizationId.length() - 3));
        
        request.setBody(JSON.serialize(data));
   
        HttpResponse response = http.send(request);
        return response.getStatusCode() == 200 ? response.getBody() : null;
    }
    
    public static Boolean suspendEngagement(String messagingId) { 
        
        MessagingSession session = [
            SELECT Conversation.ConversationIdentifier, MessagingChannel.ChannelAddressIdentifier, OwnerId
			FROM MessagingSession WHERE Id = :messagingId LIMIT 1
        ];
        
        String organizationId = UserInfo.getOrganizationId();
        String domain = DomainParser.parse(URL.getOrgDomainURL().toExternalForm()).getMyDomainName();
        
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Authorization', 'Bearer ' + getToken());
        request.setEndpoint('https://' + domain + '.my.salesforce-scrt.com/messagingchannels/v1/suspendEngagement');
        
        Map<String, String> data = new Map<String, String>();
        data.put('sessionId', messagingId);
        data.put('appType', 'agent');
        data.put('participantRoleType', 'Agent');
        data.put('reason', 'EndUserInactive');
        data.put('orgUserId', session.OwnerId);
        data.put('conversationIdentifier', session.Conversation.ConversationIdentifier);
        data.put('channelAddressIdentifier', session.MessagingChannel.ChannelAddressIdentifier);
        
        request.setBody(JSON.serialize(data));
   		//POC In progress
        HttpResponse response = http.send(request);
        System.debug('Status Code: ' + response.getStatusCode());
        System.debug('Response: ' + response.getBody());
        
        return false;
    }
}
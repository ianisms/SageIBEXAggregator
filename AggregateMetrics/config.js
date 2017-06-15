var config = {}

config.appInsights = {
    "endpoint": "https://api.applicationinsights.io/beta",
    "appId": "YOUR APP INSIGHTS APP ID",
    "key": "YOUR APP INSIGHTS APP KEY"
};

config.queries = [
    {
        "name": "TotalUserMsgs",
        "query": "customEvents | where name == 'MBFEvent.UserMessage' | project name | summarize count() by name"
    },
    {
        "name": "TotalBotMsgs",
        "query": "customEvents | where name == 'MBFEvent.BotMessage' | project name | summarize count() by name"
    },
    {
        "name": "MsgsPerUser",
        "query": "customEvents | extend userId = tostring(customDimensions [\"userId\"]) | project userId  | summarize count() by userId"
    }
];

module.exports = config;
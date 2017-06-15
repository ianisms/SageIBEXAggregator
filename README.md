[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fianisms%2FSageIBEXAggregator%2Fmaster%2Fdeploy%2Farmtmplt.json)
## What is it?
This is an Azure Function that demonstrates how to pull metrics from an Application Insights instance via a series of queries, aggregate the specific values and store the results in blob storage.

## What you'll need
- An Application Insights instance.
    - An App Id and associated App Key for the application you are interested in aggregating data for.
- An Azure Storage account to store the function app.
    - You will be prompted for this when deploying using the ARM template.
- An Azure Storage account for the aggregate data.
    - You will be prompted for this when deploying using the ARM template.

## Setup
1. Clone the repo.
2. Modify the config.js with your Application Insights App ID and App Key:
    ```
    config.appInsights = {
        "endpoint": "https://api.applicationinsights.io/beta",
        "appId": "YOUR APP INSIGHTS APP ID",
        "key": "YOUR APP INSIGHTS KEY"
    };
    ```
    And the queries you want to run:
    ``` 
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
    ```
3. Deploy to Azure using the Deploy to Azure button above:
    1. Set the storage account for the function app.
    2. Set the storage account for the aggregate data.
    3. Set the Git repo url for the cloned repo you want to deploy from.
    4. Set the branch from the cloned Git repo you wwant to deploy from.
4. Add a new container in the blog storage account named aggregates.
5. Add a new empty blob to the aggregates container named lastAggregation.json
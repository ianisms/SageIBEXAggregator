var req = require('request');
var moment = require('moment');

var config = require("./config");

module.exports = function (context, myTimer) {
    var aggregationTasks = [];
    var lastRunTimespanHours = 1;
    var lastAggregate = context.bindings.lastInputBlob;
    
    context.log('AggregateMetrics function running...', new Date().toISOString());  
    
    context.log('lastAggregate: ',  JSON.stringify(lastAggregate));

    if(lastAggregate && lastAggregate.lastAggregation) {
        var now = moment(new Date());
        var last = moment(lastAggregate.lastAggregation);
        var duration = moment.duration(now.diff(last));
        lastRunTimespanHours = Math.round(duration.asHours());
    }

    lastRunTimespanHours = 10;
        
    context.log('lastRunTimespanHours: ', lastRunTimespanHours);

    if(config.queries && config.queries.length && config.queries.length > 0) {
        for(var i = 0; i < config.queries.length; i++) {            
            aggregationTasks.push(aggregateData(context, config.queries[i], `timespan=PT${lastRunTimespanHours}H`));
        }
    }

    Promise.all(aggregationTasks).then(function(aggregationResults) {
        context.log('Aggregation tasks complete...', new Date().toISOString());   
        var resultantAggregate = {};
        resultantAggregate.lastAggregation = new Date();
        resultantAggregate.queryResults = [];

        for(var i = 0; i < aggregationResults.length; i++) {
            if(aggregationResults[i].data) {
                resultantAggregate.queryResults.push(aggregationResults[i]);
            }
        }

        context.log('resultantAggregate:', JSON.stringify(resultantAggregate)); 
        context.bindings.latestOutputBlob = JSON.stringify(resultantAggregate);
        context.bindings.lastOutputBlob = JSON.stringify(resultantAggregate);
        context.done(null, resultantAggregate);
    }).catch(err => { 
        console.log(`ERROR!: ${err}`);
        context.done(null, err);
    });  
};


function aggregateData(context, namedQuery, apiQueryParams) {

    var uri = `${config.appInsights.endpoint}/apps/${config.appInsights.appId}/query?query=${namedQuery.query}`;
    
    if(apiQueryParams) {
        uri += `&${apiQueryParams}`;
    } 

    var options = {
        url: uri,
        headers: {'x-api-key': `${config.appInsights.key}`}
    };

    return new Promise((resolve, reject) => {
        req(options, function(error, response, body) {
            if(error) {
                reject(error);
            } else {
                if(body) {
                    var data = JSON.parse(body);
                    if(data) {
                        namedQuery.data = data;
                    }
                }
                context.log('Named query result: ', JSON.stringify(namedQuery));
                resolve(namedQuery);
            }
        });
    });
}
#!/usr/bin/env /Users/chrichen/.nvm/versions/node/v8.8.0/bin/node

var _ = require('lodash');
var icons = require('./my-crypto/icons');
var holdings = require('./my-crypto/holdings');
const market = require('./my-crypto/lib/market');

const font = 'Monaco';
var totalValue = 0;
var valueWithCost = 0;
var totalCost = 0;
var currencies = ['ethereum', 'bitcoin', 'litecoin', 'bitcoin-cash'];

async function myCrypto() {

    var holdingNames = _.map(holdings, 'name');
    currencies = _.union(holdingNames, currencies);

    // get market data
    await market.getAllData(currencies);

    let cmcData = market.data;

    // holdings
    _.each(holdings, function (data, index) {

        // get cmc data
        var cmcDatum = _.get(cmcData, data.name);

        if (!cmcDatum) {
            return false;
        }

        // calculate value of holding
        var value = _.isEmpty(cmcDatum) ? 0 : data.amount * cmcDatum.price_usd;

        // add to total value
        totalValue = totalValue + value;

        // add to value with cost if there is cost
        if (!_.isNil(data.cost)) {
            valueWithCost = valueWithCost + value;
        }

        totalCost = data.cost ? totalCost + data.cost : totalCost;

        // add prices to data
        data.price = cmcDatum.price_usd;
        data.symbol = cmcDatum.symbol;
        data.value = value;

        holdings[index] = data;

    });

    _.each(holdings, function (data, index) {
        data.percentage = data.value / totalValue * 100;
        holdings[index] = data;
        if(data.cost && data.cost > 0){
            data.profit = _.round((data.value / data.cost-1) * 100, 2);
        }
        data.profit = data.profit || 'NA';
    });

    console.log(`| image=${icons.usd}`);
    console.log('---');
    console.log(`${'sym'.padEnd(8)}\t${'price'.padEnd(8)}\t${'value'.padEnd(8)}\t${'cost'.padEnd(8)}\t% | color='#000' font=${font}`);
    console.log('---');
    _.each(holdings, function (data) {
        var image = _.get(icons, _.toLower(data.symbol), icons.usd);
        data.cost = data.cost || 0;
        data.cost = _.round(data.cost, 2).toString().padEnd(8)
        data.symbol = data.symbol || '';
        data.symbol = data.symbol.padEnd(5);
        data.price = _.round(data.price, 2) || '';
        data.price = data.price.toString().padEnd(8);
        data.value = _.round(data.value, 2) || '';
        data.value = data.value.toString().padEnd(8);
        data.percentage = _.round(data.percentage, 2) || '';

        console.log(`${data.symbol}\t$${data.price}\t$${data.value}\t$${data.cost}\t${data.profit}% | color='#000' font=${font} image=${image}`);
    });
    console.log('---');
    console.log(`total: $${_.round(totalValue, 2)}\t\t% profit/loss: ${_.round(valueWithCost / totalCost * 100 - 100, 2)}% | color='#000' font=${font}`);
}

try {
    myCrypto();
}
catch (error) {
    console.error("error:", error);
    throw error;
}


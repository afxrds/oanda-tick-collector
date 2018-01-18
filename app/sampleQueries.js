db.candles.find({ 'tick.time': { '$gte': ISODate('2016-08-12T19:35:00.000Z'), '$lt': ISODate('2015-12-17T16:00:02.000Z') }, 'tick.instrument': 'EUR_USD' })

db.candles.find({ 'tick.time': { '$gte': ISODate('2016-08-12T19:35:00.000Z')}, 'tick.instrument': 'GBP_USD' })


db.ticks.count({ 'tick.time': { '$gte': ISODate('2016-06-01T19:35:00.000Z')}, 'tick.instrument': 'EUR_USD' })

db = db.getSiblingDB("instruments");
print ("Using database: " + db);
db.ticks.ensureIndex({"tick.instrument": 1, "tick.time": 1 }, {unique: true}, {background : true});

db.ticks.ensureIndex({"tick.time": 1 }, {unique: false}, {background : true});

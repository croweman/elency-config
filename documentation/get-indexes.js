db.getCollectionNames().forEach(function(collection){    
    var command = {}
    var indexes = []    
    idxs = db.getCollection(collection).getIndexes()   

    if(idxs.length>1){
        idxs.forEach(function(idoc){
            if(idoc.name!='_id_'){
                var ns = "elency-config."+idoc.ns.substr(idoc.ns.indexOf('.') + 1 )
                idoc.ns = ns
                indexes.push(idoc)
            }
        })

        command['createIndexes'] = collection
        command['indexes'] = indexes         
        print('db.runCommand(')
        printjson(command)     
        print(')')
    }
})
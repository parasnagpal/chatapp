
//Deprecated file
const {MongoClient}=require('mongodb')
const mongo_url="mongodb://localhost:27017";


function add(name){
    //write user
    MongoClient.connect(mongo_url,(err,client)=>{
        if(err) throw err
    
        const whatsds=client.db("node")
        const connections=whatsds.collection("connections")
        connections.insertOne({"Name":name},()=>{
            console.log('Inserted')
        })
        client.close()
    })

    //read data
    /*MongoClient.connect(mongo_url,(err,client)=>{
        if(err) throw err
    
        const whatsds=client.db("node")
        const connections=whatsds.collection("connections")
        connections.find({}).toArray((err,res)=>{
            if(err) throw err
            console.log(res)
        })
        client.close()
    })*/
}

/*
function find(name){

    MongoClient.connect(mongo_url,(err,client)=>{
        if(err) throw err
       
        //database
        const whatsds=client.db("node")
       //table 
        const connections=whatsds.collection("connections")
        
        //find name
        connections.find({'Name':name}).toArray((err,res)=>{
            if(err) throw err

             reply(res.toString)
        })
        client.close()
    })
    
}

module.exports={
    MongoClient,
    add,find
}
*/
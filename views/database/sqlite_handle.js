const sqlite=require('sqlite3').verbose()


const db=new sqlite.Database(__dirname+'/sqlite.db',sqlite.OPEN_READWRITE,(err)=>{
  console.log(err)
},
console.log("connected to Users database")
)
/*
db.serialize(()=>{
  db.run('DROP TABLE users')
  db.run(`CREATE TABLE Users (fname VARCHAR(255) NOT NULL,
                              lname VARCHAR(255),
                              username VARCHAR(255) NOT NULL,
                              password VARCHAR(50) NOT NULL,
                              socketID VARCHAR(100),
                              PRIMARY KEY (username));`,(err)=>{
                                if(err) console.log(err)
})
})*/

module.exports=db
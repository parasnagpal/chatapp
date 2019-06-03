const Sequelize=require('sequelize')

const sequelize=new Sequelize({
    dialect:'sqlite',
    storage:__dirname+'/sqlite.db',
    timestamps:false
});

sequelize
  .authenticate()
  .then(()=>{
      console.log('Connection established')
  })
  .catch((err)=>{
      console.log('Problem',err);
  })

  const User=sequelize.define('user',{
      //attributes
      fName:{
          type:Sequelize.STRING,
          allowNull:false
      },
      lName:{
           type:Sequelize.STRING,
      },
      userName:{
          type:Sequelize.STRING,
          unique:true
      },
      password:{
          type:Sequelize.STRING,
          allowNull:false
      },
      SocketID:{
         type:Sequelize.STRING
      }
  })

  User.sync({force:true})
  


  
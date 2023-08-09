const mongoose=require('mongoose')


const regSchema=mongoose.Schema({
    email:String,
    password:String,
    firstName:String,
    lastName:String,
    mobile:Number,
    desc:String,

    img:{type:String,default:'unnamed.jpg'},
    status:{type:String,default:'unverified'},
    role:{type:String ,default:'public'}
})





module.exports=mongoose.model('reg',regSchema)
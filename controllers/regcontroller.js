const Reg=require('../models/reg')
const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer')
const userRouter=require('../routers/user')



exports.loginpage=(req,res)=>{
    res.render('login.ejs',{massage:''})
}
exports.signuppage=(req,res)=>{
    res.render('signup.ejs',{massage:''})
}

exports.postsignuppage=async(req,res)=>{
    //console.log(req.body)
const{email,password}=req.body
try{
const convertPassword=await bcrypt.hash(password,10)
    //console.log(convertPassword)
const usercheck=await Reg.findOne({email:email})
if (usercheck==null){
const record=new Reg({email:email,password:convertPassword})
record.save()
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user:'gokushubh82@gmail.com', // generated ethereal user
      pass:'htkahejvkuevstrp', // generated ethereal password
    },
  });
        //console.log('connected to gmail smtp server')

        let info = await transporter.sendMail({
            from:'gokushubh82@gmail.com' , // sender address
            to: email, // list of receivers
            subject: 'email verifiction', // Subject line
            text: "click given link to apoorve email", // plain text body
            html: `<a href=http://localhost:5000/emailactivelink/${email}>verify email</a>`, // html body
          });

         // console.log('sent to mail')



res.render('signup.ejs',{massage:'Account creation successful'})}
else{
res.render('signup.ejs',{massage:'Email is already exist'}) 
}
    //console.log(record)
}catch(error){
console.log(error)
}
}

exports.postloginpage=async(req,res)=>{
                                        //console.log(req.body)
        const{email,password}=req.body
        const record=await Reg.findOne({email:email})
                                        //console.log(record)
        if(record!==null){
            const passwordcheck=await bcrypt.compare(password,record.password)
                                        //console.log(passwordcheck)
            if(passwordcheck){
                req.session.isAuth=true
                req.session.loginname=email
                req.session.role=record.role
                if(record.email=='admin1@gmail.com'||record.email=='admin@gmail.com'){
                    res.redirect('/admin/dashboard')
                }else if(record.status=='unverified'){
                    res.render('login.ejs',{massage:'Email is not verified. Kindly check mail to verify'})
                }
                else{
                res.redirect('/userprofiles')
                }
            }else{
                res.render('login.ejs',{massage:'Wrong input'}) 
            }
        }else{
            res.render('login.ejs',{massage:'Wrong input'})
        }
}

exports.forgotform=(req,res)=>{
    res.render('forgotform.ejs',{massage:''})
}

exports.postforgotform=async(req,res)=>{
                                        // console.log(req.body)
        const{email}=req.body
        const record= await Reg.findOne({email:email})
                                        // console.log(record)
        if(record==null){
            res.render('forgotform.ejs',{massage:'Email is not resitered'})
        }else{
            let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user:'gokushubh82@gmail.com', // generated ethereal user
      pass:'htkahejvkuevstrp', // generated ethereal password
    },
  });
       // console.log('connected to gmail smtp server')
        let info = await transporter.sendMail({
            from:'gokushubh82@gmail.com' , // sender address
            to: email, // list of receivers
            subject: 'recovery mail', // Subject line
            text: "click given link to change password", // plain text body
            html: `<a href=http://localhost:5000/forgotpasschange/${email}>Change password</a>`, // html body
          });

          //console.log('sent to mail')
          res.render('forgotform.ejs',{massage:'mail sent please check your gmail'})

        }
}

exports.forgotpasschangeform=(req,res)=>{
                                        //console.log(req.params.email)
    const{email}  =req.params.email                                 
    res.render('forgotpasschange.ejs',{email})
}

exports.postforgotpasschange=async(req,res)=>{
    const email=req.params.email
    const record=await Reg.findOne({email:email})
                                    //  console.log(record)         
    const id=record.id                        
    const{password}=req.body
                                    //console.log(req.body)
    const newPass=await bcrypt.hash(password,10)
    await Reg.findByIdAndUpdate(id,{password:newPass})
    //console.log(newPass)
    res.render('forgotpassmassage.ejs')

}

exports.admindashboard=(req,res)=>{
                                    // console.log(req.session)
    const loginname=req.session.loginname
    res.render('admin/dashboard.ejs',{loginname})
}

exports.logout=(req,res)=>{
    req.session.destroy()
    res.redirect('/')
}

exports.allusers=async(req,res)=>{
    const loginname=req.session.loginname
    const record=await Reg.find()
    res.render('admin/users.ejs',{loginname,record})
}

exports.userdelete=async(req,res)=>{
                            //console.log(req.params.id)
    const id=req.params.id
    await Reg.findByIdAndDelete(id)
    res.redirect('/admin/users')
}

exports.emailactive=async(req,res)=>{
    //console.log(req.params.email)
    const email=req.params.email
    const record=await Reg.findOne({email:email})
    //console.log(record)
    const id=record.id
    await Reg.findByIdAndUpdate(id,{status:'verfied'})
    res.render('activelinkmassage.ejs',{massage:'Email verified'})
}

exports.userprofiles=async(req,res)=>{
   // console.log(req.session)
   const loginname=req.session.loginname
   const record=await Reg.find({img:{$nin:['unnamed.jpg']}})
    res.render('userprofiles.ejs',{loginname,record})
}

exports.profileupdate=async(req,res)=>{
    const loginname=req.session.loginname
    const record= await Reg.findOne({email:loginname})
    //console.log(record)
    res.render('profileupdate.ejs',{loginname,record,massage:''})
}

exports.postprofileupdate=async(req,res)=>{
    //console.log(req.file)
   
   // console.log(req.body)
   const {fname,lname,mobile,about}=req.body
   const loginname=req.session.loginname
   const record= await Reg.findOne({email:loginname})
  // console.log(record)
  const id=record.id
  if(req.file){
    const filename=req.file.filename
  
  await Reg.findByIdAndUpdate(id,{firstName:fname,lastName:lname,mobile:mobile,desc:about,img:filename})
  }else{await Reg.findByIdAndUpdate(id,{firstName:fname,lastName:lname,mobile:mobile,desc:about})}
  //res.render('profileupdate.ejs',{loginname,record,massage:'Profile Updated'})
  res.redirect('/profileupdate')
  
}

exports.singleprofile=async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const loginname=req.session.loginname
    const record=await Reg.findById(id)
    res.render('singleprofile.ejs',{loginname,record})
}

exports.roleupdate=async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const record=await Reg.findById(id)
    let currentrole=null
    if(record.role=='subscribed'){
        currentrole='public'
    }else{
        currentrole='subscribed'
    }
    await Reg.findByIdAndUpdate(id,{role:currentrole})
    res.redirect('/admin/users')

}

exports.statusupdate=async(req,res)=>{
    //console.log(req.params.id)
    const id=req.params.id
    const record=await Reg.findById(id)
   // console.log(record)
   let currentstatus=null
    if(record.status=='unverified'){
        currentstatus='verified'
    }else{
        currentstatus='unverified'
    }
    await Reg.findByIdAndUpdate(id,{status:currentstatus})
    res.redirect('/admin/users')
}
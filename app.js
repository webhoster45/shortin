require('dotenv').config();
const path=require('path');
const express=require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose=require('mongoose');
const bcrypt=require("bcrypt");
const { type } = require('os');
const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const {createClient}=require('redis');
const { Socket } = require('dgram');
const MONGODB_URL=process.env.MONGODB_URL;
const JWT_SECRET=process.env.JWT_SECERT;
const activeclients=[];

const Userschema=mongoose.Schema({
	username:{type:String,required:true},
	email:{type:String,required:true},
	password:{type:String,required:true}
},{timestamps:true})

const Surlschema=mongoose.Schema({
    original_url:{type:String,required:true},
    shortcode:{type:String,required:true},
	creator:{type:String,required:true},
	clickcount:{type:Number,default:0}
},{timestamps:true})

const Surl=mongoose.model('Surl',Surlschema)
const User=mongoose.model('User',Userschema)

// const redisoptions={
// 	url:process.env.REDIS_URL,
// 	socket:(retries)=>Math.min(retries*250,300)
// }

// const redispublisher=createClient(redisoptions);
// const redissubscriber=createClient(redisoptions);

// for(const client of [redispublisher,redissubscriber]){
// 	client.on('error',(error)=>console.log('Redis Client Error',error.message))
// }

// function requireredis(req,res,next){
// 	if (redispublisher.isReady||redissubscriber.isReady) next();
// 	return res.status(503).json({message:'Redis is unavaliable'})
// }


const authmiddleware=async (req,res)=>{
	try {
		const authheader=req.headers.authorization;
		if(!authheader) return res.status(401).json({message:"Unauthorized"});
		const token=authheader.split(" ")[1];
		if(!token) return res.status(401).json({message:"Unauthorized"})
		jwt.verify(token,JWT_SECRET,(err,decoded)=>{
			if(err) return res.status(401).json({message:"Unauthorized"})
			req.user=decoded;
			next();
		})

	} catch (error) {
		return res.status(500).json({message:"Internal Server Error",error})
	}
}

async function startapp(){
	if(!MONGODB_URL || !JWT_SECRET) { console.log('MONGODB_URL AND JWT_SECRET ARE REQUIRED'); return;}
	await Promise.all([
		// redispublisher.connect(),
		// redissubscriber.connect(),
		mongoose.connect(MONGODB_URL).then(()=>console.log('MongoDB connected'))
	]);
	// await redissubscriber.subscribe('notifications',(message)=>{
	// 	for (const client of activeclients) client.write(`data:${message}\n\n`)
	// })
    app.listen(port, () => {
	console.log(`Shortin is running at Port: ${port}`);
});
}



function generatelogic(){
	let string='';
	for (let i=0;i<6;i++){
		let randomshit=Math.floor(Math.random()*characters.length);
		string+=characters[randomshit];
	}
	return string;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'code.html'));
});

app.post('/registerorlogin',authmiddleware,async (req,res)=>{
	try {
		const {username,password,email}=req.body;
        if(!username||!password||!email) return res.status(400).json({message:"Missing Parameters"});
		const existinguser=await User.findOne({username});
		if(!existinguser){
           const encrypted=await bcrypt.hash(password,10);
		}
		await User.create({username,password,email});
		const token=jwt.sign({username,encrypted},JWT_SECRET)
		return res.status(200).json({message:`${username} has been created / Logged in`,token})
	} catch (error) {
		return res.status(500).json({message:"Internal Server Error",error})
	}
})

app.post('/shorten',authmiddleware,async (req,res)=>{
try {
	const username=req.user.username;
	const {original_url,creator}=req.body;
	let shortcode=generatelogic()
    await Surl.create({original_url,shortcode,creator:username});
	return res.status(200).json({message:'Short Url created'});
} catch (error) {
	return res.status(500).json({message:"Internal Server Error",error})
}
});


app.post('/:shortcode',authmiddleware,async (req,res)=>{
	try {
	const username=req.user.username;
    const shortcode=req.params.shortcode;
	const existing=await User.findOne({shortcode})
	if(!existing) return res.status(404).json({message:"Link not found in database"})
	res.redirect(existing.original_url)
	} catch (error) {
		return res.status(500).json({message:'Internal Server Error',error})
	}
})
startapp();
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
const jwt=require("jsonwebtoken");
const { resolveSoa } = require('dns');
const activeclients=[];

const allowedevents=new Set(['cacheresults','registerorlogin','clicks','expirytime'])

const keys={
	coderecord:'Short Code records: ',
	cache:'Cache Redirect Results: '
}

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

const Eventschema=mongoose.Schema({
	eventtype:{type:String,required:true},
	username:{type:String,required:true},
	user:{type:String,required:true},
	query:{type:String,required:true}
},{timestamps:true});

//	const event=await Event.create({eventtype,username,user:user._id,query})
const Surl=mongoose.model('Surl',Surlschema);
const User=mongoose.model('User',Userschema);

//----------------------------Comment this part when you want to start testing without redis-------

const redisoptions={
	url:process.env.REDIS_URL,
	socket:(retries)=>Math.min(retries*250,300)
}

const redispublisher=createClient(redisoptions);
const redissubscriber=createClient(redisoptions);

for(const client of [redispublisher,redissubscriber]){
	client.on('error',(error)=>console.log('Redis Client Error',error.message))
}

function requireredis(req,res,next){
	if (redispublisher.isReady||redissubscriber.isReady) next();
	return res.status(503).json({message:'Redis is unavaliable'})
}

async function claimevent(eventid,username){
   try {
	   if(!eventid) return null;
	   if(eventid.length>200){
	   const error=new Error('Idempotency key too long')
	   error.status(400);
	   throw error;
	   }
	   const key=`event: ${username} : ${eventid}`;
	   const claimed=await redispublisher.set(key,processing,{NX:true,EX:86400});
	   if(!claimed=='OK'){
		const error=new Error("Event already processing");
		error.status=409;
		throw error;
	   }
	   return key;
   } catch (error) {
	   console.log("Error")
   }
}

async function recordmetrics({eventtype,username,user:user._id,query}){

}


//----------------------------Comment this part when you want to start testing without redis-------


const authmiddleware=async (req,res,next)=>{
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
		console.log("here ooo")
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

app.post('/registerorlogin',async (req,res)=>{
	try {
		const {username,password,email}=req.body;
        if(!username||!password||!email) return res.status(400).json({message:"Missing Parameters"});
		const existinguser=await User.findOne({username});

		if(!existinguser){
           const encrypted=await bcrypt.hash(password,10);
		   await User.create({username,password:encrypted,email});
		   const token=jwt.sign({username},JWT_SECRET)
		   return res.status(200).json({message:`User ${username} created successfully`,token})
		}
		else{
			const match=await bcrypt.compare(password,existinguser.password)
			console.log("Reached here")
			if(match){
                const token=jwt.sign({username},JWT_SECRET)
				console.log("Reached here 2")
		        return res.status(200).json({message:`User ${username} signed in successfully`,token})

			}
			else{
				return res.status(200).json({message:"Wrong username or password"})
			}
		}
		
	} catch (error) {
		return res.status(500).json({message:"Internal Server Error",error})
	}
})

app.post('/shorten',authmiddleware,async (req,res)=>{
try {
	const username=req.user.username;
	const {original_url,choice}=req.body;
	let shortcode;
	if(choice){
        const existingcode=await Surl.findOne({choice})
		if(existingcode) return res.status(409).json({message:`The typed shortcode is already taken`})
		shortcode=choice
	}
	else{
		shortcode=generatelogic()
	}

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
	const existing=await Surl.findOne({shortcode})
	console.log(shortcode,existing)
	if(!existing) return res.status(404).json({message:"Link not found in database"})
	res.redirect(existing.original_url)
	} catch (error) {
		return res.status(500).json({message:'Internal Server Error',error})
	}
});

app.post('/event',authmiddleware,requireredis,async (req,res)=>{
	let idempotencykey;
  try {
	const {eventtype,metadata,query}=req.body;
	if(!eventtype||!metadata||!query) return res.status(400).json({message:"Incomplete parameters"});
    if(!allowedevents.has(eventtype)) return res.status(400).json({message:`${eventtype} not supported`});
    const username=req.user.username;
	const user=User.findOne({username}).select("_id username")
	if(!user) return res.status(400).json({message:"User doesn't exist"});
    
	const eventid=req.get('Idempotency-Key');
	idempotencykey=await claimevent(eventid,username);
	const event=await Event.create({eventtype,username,user:user._id,query})
    await recordmetrics({eventtype,username,user:user._id,query})


  } catch (error) {
	return res.status(500).json({message:'Internal Server Error',error})
  }
})

app.use((req,res)=>{
  return res.status(404).json({message:"Page Not Found"})
})


startapp();
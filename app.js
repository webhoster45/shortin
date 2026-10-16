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
const {randomUUID}=require('crypto');
const { Socket } = require('dgram');
const MONGODB_URL=process.env.MONGODB_URL;
const JWT_SECRET=process.env.JWT_SECERT;
const jwt=require("jsonwebtoken");
const cookieparser=require('cookie-parser')
const { resolveSoa } = require('dns');
const activeclients=new Map();


const allowedevents=new Set(['cacheresults','registerorlogin','shortcodes'])

const keys={
	coderecord:'Short Code records: ',
	cache:'Cache Redirect Results: ',
	eventcache:'Event Cache Results: ',
	getin:'Register or logins: ',
	clicks:"Redirect click leaderboard v2",
	activeusers:'Total Active Users',
    clickcount:"Redirect click count v2 "
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
	expiry:{type:String,required:true},
},{timestamps:true})
Surlschema.index({shortcode:1},{unique:true});

const Eventschema=mongoose.Schema({
	eventtype:{type:String,required:true},
	username:{type:String,required:true},
	userid:{type:String,required:true},
	query:{type:String,required:true}
},{timestamps:true});

//	const event=await Event.create({eventtype,username,user:user._id,query})
const Surl=mongoose.model('Surl',Surlschema);
const User=mongoose.model('User',Userschema);
const Event=mongoose.model('Event',Eventschema)

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
	if (redispublisher.isReady&&redissubscriber.isReady) return next();
	return res.status(503).json({message:'Redis is unavaliable'})
}

function activitykey(shortcode){
	return `Activity: ${shortcode}: ${new Date().toISOString().split('T')[0]}`
}



app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static('/public'));
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(cookieparser())

async function claimevent(eventid,username){
   try {
	   if(!eventid) return null;
	   if(eventid.length>200){
	   const error=new Error('Idempotency key too long')
	   error.status=400;
	   throw error;
	   }
	   const key=`event: ${username} : ${eventid}`;
	   const claimed=await redispublisher.set(key,'processing',{NX:true,EX:86400});
	   if(claimed !=='OK'){
		const error=new Error("Event already processing");
		error.status=409;
		throw error;
	   }
	   return key;
   } catch (error) {
		   console.log("Error")
	throw error

   }
}

async function recordmetrics({shortcodeid,eventtype,username,userid,query,cache,author}){
try {
	const activity=`${username} ${eventtype} : ${query}`;
	const eventcachekey=`${keys.eventcache}${shortcodeid}`;
    console.log(shortcodeid)
    console.log(cache)

    await Promise.all([
	redispublisher.zAdd(keys.activeusers,{score:Date.now(),value:String(userid)}),
    redispublisher.sAdd(activitykey(shortcodeid),activity),
    cache!==undefined ? redispublisher.set(eventcachekey,typeof cache==='string' ? cache : JSON.stringify(cache),{EX:7200}): Promise.resolve()
])



} catch (error) {
	console.log({message:"Internal Server Error",error})
}
}


//----------------------------Comment this part when you want to start testing without redis-------


const authmiddleware=async (req,res,next)=>{
	const authenticationFailed=()=>{
		if(req.path==='/event' || req.path.startsWith('/analytics/') || req.path.startsWith('/api/')) {
			return res.status(401).json({message:'Authentication required'});
		}
		return res.redirect('/registerorlogin');
	};
	try {
		// const authheader=req.headers.authorization;

		// if(!authheader) return res.status(401).json({message:"Unauthorized"});

		const token=req.cookies.shortin_token;


		if(!token) return authenticationFailed();
	
		jwt.verify(token,JWT_SECRET,(err,decoded)=>{
			if(err) return authenticationFailed();
			req.user=decoded;
	         console.log(decoded)
 			next();
		})

	} catch (error) {
		  return authenticationFailed();
	}
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
	res.render('index')
});


app.get('/registerorlogin', (req, res) => {
     if(req.cookies.shortin_token) return res.redirect('/dashboard');
	 res.render('login')
});


app.get('/dashboard',authmiddleware, async (req, res) => {
	try {

  
		const username=req.user.username;
		
		const usershortcodes=await Surl.find({creator:username});
        const allshortcodes=await Surl.find({});
		const nowtime=Math.floor(Date.now()/1000);
		const activeshortcodes=[];
		const expiredids=[];

		usershortcodes.forEach(s=>{
			// const [month,day,year,hour,minute,second]=s.expiry.split(/[\s,/:]/).map(Number);
			const dbtime=Math.floor(Date.UTC(new Date(s.expiry).getTime())/1000)

			if(dbtime<nowtime) expiredids.push(s._id)
			else activeshortcodes.push(s)

			console.log(`DB Time: ${dbtime} | Now Time : ${nowtime}`)
		})


     
		if(expiredids.length>0){
			Surl.deleteMany({_id:{$in: expiredids}})
			.then(result=>console.log(`Background sweep completd `))
			.catch(err=>console.error("Error durning sweep:",err))
		}

		
		// const nowman=new Date(Date.now()).toLocaleString()
		res.render('dashboard',{
			username:username,
			shortcodes: activeshortcodes || [],
			baseUrl:(process.env.SHORT_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/,'')
		})
	} catch (error) {
		    console.log(error)
			return res.status(500).json({message:"Internal Server Error",error})
	
	}
});



app.post('/registerorlogin',async (req,res)=>{
	try {
		const {username,password,email}=req.body;
        if(!username||!password) return res.status(400).json({message:"Missing Parameters"});
		const existinguser=await User.findOne({username});

		if(!existinguser){
			if(!email) return res.status(400).send("An email address is required to register a new user")
           const encrypted=await bcrypt.hash(password,10);
		   await User.create({username,password:encrypted,email});
		   const token=jwt.sign({username},JWT_SECRET);

		   res.cookie('shortin_token',token,{
			httpOnly: true,
			sameSite:'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7200 * 1000
		   })
		   return res.redirect('/dashboard')
		}
		else{
			const match=await bcrypt.compare(password,existinguser.password)
			console.log("Reached here")
			if(match){
                const token=jwt.sign({username},JWT_SECRET)
				console.log("Reached here 2")
		        // return res.status(200).json({message:`User ${username} signed in successfully`,token,username})
            

			res.cookie('shortin_token',token,{
				httpOnly: true,
				sameSite:'lax',
				secure: process.env.NODE_ENV === "production",
				maxAge: 7200 * 1000
			})
            console.log(token)
			return res.redirect('/dashboard')
			}
			else{
				return res.status(500).json({message:"Wrong username or password"})
			}
		}

	} catch (error) {
		return res.status(500).json({message:"Internal Server Error",error})
	}
})

app.get('/api/getuser',authmiddleware,async(req,res)=>{
		try {
		res.status(200).json({message:"successful",user:req.user})
	} catch (error) {
			return res.status(500).json({message:"Internal Server Error",error})
	
	}
})

app.post('/shorten',authmiddleware,async (req,res)=>{
try {
	const username=req.user.username;
	const {original_url}=req.body;
	const choice=typeof req.body.choice==='string' ? req.body.choice.trim() : '';
	if(!original_url) return res.status(400).json({message:"Missing parameters"});
	let parsedUrl;
	try { parsedUrl=new URL(original_url); } catch { return res.status(400).json({message:"A valid URL is required"}); }
	if(!['http:','https:'].includes(parsedUrl.protocol)) return res.status(400).json({message:"Only HTTP and HTTPS links are allowed"});
	if(choice && !/^[a-zA-Z0-9_-]{3,40}$/.test(choice)) return res.status(400).json({message:"Alias must be 3â€“40 letters, numbers, underscores, or hyphens"});
	let shortcode=choice;
	const expirydate=new Date(Date.now()+7200*1000).toISOString()
	if(choice && await Surl.exists({shortcode})) return res.status(409).json({message:"The typed shortcode is already taken"});
	if(!choice){
		for(let attempt=0;attempt<5;attempt++){
			shortcode=generatelogic();
			if(!await Surl.exists({shortcode})) break;
			shortcode='';
		}
		if(!shortcode) return res.status(503).json({message:"Could not generate a shortcode; please retry"});
	}
	await Surl.create({original_url:parsedUrl.toString(),shortcode,creator:username,expiry:expirydate});
	await Promise.all([
		redispublisher.set(keys.coderecord+shortcode,shortcode,{EX:7200}),
		redispublisher.set(keys.cache+shortcode,parsedUrl.toString(),{EX:7200})
	]);
	if(req.accepts('json')) return res.status(201).json({success:true,shortcode});
	return res.redirect('/dashboard')
} catch (error) {
	if(error.code===11000) return res.status(409).json({message:"The typed shortcode is already taken"});
	console.error(error);
	return res.status(500).send('error')
}
});

// app.get('/api/getshortcode/:username',authmiddleware,async (req,res)=>{
// 		try {
// 	 const username=req.params.username
//      const shortcodes=await Surl.find({username});
// 	 if(!shortcodes) return res.status(200).json({message:"No Shortcodes for this user"});
// 	 res.status(200).json({message:shortcodes})
// 	} catch (error) {
// 		return res.status(500).json({message:"Internal Server Error",error})
// 	}
// })


app.get('/stream',authmiddleware,async (req,res)=>{
	try {
		res.writeHead(200,{
			'Content-Type':'text/event-stream',
			'Cache-Control':'no-cache , no transform',
			connection:'keep-alive',
		}

	)
	res.write(' :connected\n\n')

	activeclients.set(res,req.user.username);
	console.log('SSE Stream: Client registered')
	const heartbeat=setInterval(()=>{res.write(': heartbeat\n\n')},30000);
	req.on('close',()=>{
		clearInterval(heartbeat);
		activeclients.delete(res)
		console.log('SSE Stream: Client registered')
	})
	} catch (error) {
		return res.status(500).json({message:"Internal Server Error",error})
	}
})

app.post('/event',authmiddleware,requireredis,async (req,res)=>{
	let idempotencykey;
  try {
	const {eventtype,shortcode,query,cache}=req.body;
	if(!eventtype||!shortcode||!query) return res.status(400).json({message:"Incomplete parameters"});
    if(!allowedevents.has(eventtype)) return res.status(400).json({message:`${eventtype} not supported`});
    
	const username=req.user.username;
    
	const user=await User.findOne({username}).select("_id username")
    let shortcodedoc=await Surl.findOne({shortcode});
	console.log(shortcodedoc)
	    if(!shortcodedoc) return res.status(400).json({message:"Shortcode doesn't exist"});
		if(!user) return res.status(400).json({message:"User doesn't exist"})
	if(new Date(shortcodedoc.expiry).getTime()<=Date.now()) return res.status(410).json({message:"Shortcode expired"});
	let shortcodeid = shortcodedoc._id.toString();

	const eventid=req.get('Idempotency-Key');
	idempotencykey=await claimevent(eventid,username);

    
	const event=await Event.create({eventtype,username,userid:user._id,query})

    await recordmetrics({shortcodeid:shortcode,eventtype,username,userid:user._id,query,cache})

    if(idempotencykey) await redispublisher.set(idempotencykey,'processed',{EX: 86400})

	await redispublisher.publish('notifications',JSON.stringify({shortcodeid,shortcode,creator:shortcodedoc.creator,eventtype,username,userid:user._id,query,cache,createdAt:event.createdAt}));
	return res.status(201).json({success:true,message:`${username}: ${eventtype} registered successfully`});
  } catch (error) {
	if(idempotencykey)await redispublisher.del(idempotencykey).catch(()=>{})
	return res.status(error.status||500).json({success:false,message:error.message||'Internal Server Error'})
  }
});

app.post('/analytics/overview',authmiddleware,requireredis,async (req,res)=>{
	try {
		const {shortcode}=req.body;
		if(typeof shortcode!=='string' || !shortcode) return res.status(400).json({message:'A shortcode is required'});
		const shortcodedoc=await Surl.findOne({shortcode});
		if(!shortcodedoc) return res.status(404).json({message:'Shortcode not found'});
		if(shortcodedoc.creator!==req.user.username) return res.status(403).json({message:'You do not own this shortcode'});
		const expiryTime=new Date(shortcodedoc.expiry).getTime();
		const ttlSeconds=Math.ceil((expiryTime-Date.now())/1000);
		if(ttlSeconds>0 && !(await redispublisher.get(`${keys.cache}${shortcode}`))){
			await Promise.all([
				redispublisher.set(`${keys.cache}${shortcode}`,shortcodedoc.original_url,{EX:ttlSeconds}),
				redispublisher.set(`${keys.coderecord}${shortcode}`,shortcode,{EX:ttlSeconds})
			]);
		}
		const [activity,clickScore,redirectCachePayload,eventCachePayload,clickcounts,activeUserIds,shortCodeRecord,clickRank]=await Promise.all([
			redispublisher.sMembers(activitykey(shortcode)),
			redispublisher.zScore(keys.clicks,shortcode),
			redispublisher.get(`${keys.cache}${shortcode}`),
			redispublisher.get(`${keys.eventcache}${shortcode}`),
			redispublisher.get(`${keys.clickcount}${shortcode}`),
			redispublisher.zRangeByScore(keys.activeusers,Date.now()-300000,'+inf'),
			redispublisher.get(`${keys.coderecord}${shortcode}`),
			redispublisher.zRevRank(keys.clicks,shortcode)
		]);
		const redirectVisitsLastFiveMinutes=await redispublisher.zCount(
			`Recent Redirect Visits: ${shortcode}`,
			Date.now()-300000,
			'+inf'
		);
		return res.status(200).json({
			success:true,
			shortcode,
			redis:{
				clickCount:Number(clickcounts||0),
				clickLeaderboardScore:clickScore==null ? 0 : Number(clickScore),
				clickLeaderboardRank:clickRank===null ? null : clickRank+1,
				activeUsersLast5Minutes:activeUserIds.length,
				redirectVisitsLastFiveMinutes,
				activity,
				shortCodeRecord,
				redirectCachePayload,
				redirectCachePresent:redirectCachePayload!==null,
				eventCachePayload
			}
		});
	} catch(error) {
		console.error('Failed to gather analytical metrics',error);
		return res.status(500).json({message:'Internal Server Error'});
	}
});
app.delete('/shortcode/:shortcode',authmiddleware,async (req,res)=>{
try{
	const shortcode=req.params.shortcode;
	const existing=await Surl.findOne({shortcode,creator:req.user.username});

	if(!existing) return res.status(404).json({message:"Shortcode doesn't exist"});
    await Surl.findOneAndDelete({shortcode,creator:req.user.username})
	await Promise.all([
		redispublisher.del(`${keys.coderecord}${shortcode}`),
		redispublisher.del(`${keys.cache}${shortcode}`),
		redispublisher.del(`${keys.eventcache}${shortcode}`)
	]);

	return res.redirect('/dashboard')
}catch(err){
	console.log(err);
	return res.status(500).json({message:'Internal Server Error',err})
}})



app.get('/:shortcode',async (req,res)=>{
	try {
	const shortcode=req.params.shortcode;
	const cacheKey=`${keys.cache}${shortcode}`;
	const codeRecord=await redispublisher.get(`${keys.coderecord}${shortcode}`);
	let cachedDestination=codeRecord ? await redispublisher.get(cacheKey) : null;
	let destination;
	if(cachedDestination){
		try { destination=new URL(cachedDestination); } catch { destination=null; }
		if(destination && !['http:','https:'].includes(destination.protocol)) destination=null;
	}
	let existing=null;
	if(!destination){
		existing=await Surl.findOne({shortcode});
		if(!existing) return res.status(404).json({message:"Link not found in database"});
		const expiryTime=new Date(existing.expiry).getTime();
		if(!Number.isFinite(expiryTime) || expiryTime<=Date.now()){
			await Promise.all([
				Surl.deleteOne({_id:existing._id}),
				redispublisher.del(`${keys.coderecord}${shortcode}`),
				redispublisher.del(cacheKey)
			]);
			return res.status(410).json({message:"Shortcode expired"});
		}
		destination=new URL(existing.original_url);
		if(!['http:','https:'].includes(destination.protocol)) return res.status(400).json({message:'Invalid redirect destination'});
		const ttlSeconds=Math.max(1,Math.ceil((expiryTime-Date.now())/1000));
		await Promise.all([
			redispublisher.set(`${keys.coderecord}${shortcode}`,shortcode,{EX:ttlSeconds}),
			redispublisher.set(cacheKey,destination.toString(),{EX:ttlSeconds})
		]);
	}
	if(!['http:','https:'].includes(destination.protocol)) return res.status(400).json({message:'Invalid redirect destination'});
	try {
		await Promise.all([
			redispublisher.incr(`${keys.clickcount}${shortcode}`),
			redispublisher.zIncrBy(keys.clicks,1,shortcode),
			redispublisher.zAdd(`Recent Redirect Visits: ${shortcode}`,{score:Date.now(),value:randomUUID()}),
			redispublisher.zRemRangeByScore(`Recent Redirect Visits: ${shortcode}`,0,Date.now()-300000),
			redispublisher.expire(`Recent Redirect Visits: ${shortcode}`,600)
		]);
	} catch(metricsError) {
		console.error('Could not record redirect analytics',metricsError);
	}
	res.redirect(destination.toString())
	} catch (error) {
		console.log(error)
		return res.status(500).json({message:'Internal Server Error',error})
	}
});



app.use((req,res)=>{
  return res.status(404).json({message:"Page Not Found"})
})


async function startapp(){
	if(!MONGODB_URL || !JWT_SECRET) { console.log('MONGODB_URL AND JWT_SECRET ARE REQUIRED'); return;}
	await Promise.all([
		redispublisher.connect(),
		redissubscriber.connect(),
		mongoose.connect(MONGODB_URL).then(()=>console.log('MongoDB connected'))
	]);
	await redissubscriber.subscribe('notifications',(message)=>{
		const event=JSON.parse(message);
		for (const [client,username] of activeclients) {
			if(username===event.creator) client.write(`data:${message}\n\n`)
		}
	})
    app.listen(port, () => {
	console.log(`Shortin is running at Port: ${port}`);
});
}


startapp();

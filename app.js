require('dotenv').config();
const path=require('path');
const express=require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose=require('mongoose');
const { type } = require('os');
const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const {createClient}=require('redis');
const { Socket } = require('dgram');
const MONGODB_URL=process.env.MONGODB_URL;
const JWT_SECRET=process.env.JWT_SECERT;
const activeclients=[];

const Surlschema=mongoose.Schema({
    original_url:{type:String,required:true},
    shortcode:{type:String,required:true},
	creator:{type:String,required:true},
	clickcount:{type:Number,default:0}
},{timestamps:true})

const Surl=mongoose.model('Surl',Surlschema)


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

app.post('/shorten',async (req,res)=>{
try {
	const {original_url,creator}=req.body;
	let shortcode=generatelogic()
    await Surl.create({original_url,shortcode,creator:"wale"});
	return res.status(200).json({message:'Short Url created'});
} catch (error) {
	return res.status(500).json({message:"Internal Server Error",error})
}
})

startapp();
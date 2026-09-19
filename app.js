require('dotenv').config();
const path=require('path');
const express=require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose=require('mongoose');
const { type } = require('os');
const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const {createClient}=require('redisclient');
const { Socket } = require('dgram');

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

const Surlschema=mongoose.Schema({
    original_url:{type:String,required:true},
    shortcode:{type:Number,required:true},
	clickcount:{type:Number}
})

const Surl=mongoose.model('Surl',Surlschema)

function generatelogic(){
	let string='';
	for (let i=0;i<6;i++){
		let randomshit=Math.floor(Math.random()*characters.length);
		string+=characters[randomshit];
	}
	return string;
}

function requireredis(){
	
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'code.html'));
});



app.listen(port, () => {
	console.log(`Shortin is running at http://localhost:${port}`);
});
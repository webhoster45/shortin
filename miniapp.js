const port = process.env.PORT || 4000;
const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const path=require('path');
const express=require('express');
const app=express();


app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static('/public'));
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))


app.get('/',(req,res)=>{
    res.render('index')
})

app.listen(port, () => {
	console.log(`Shortin is running at Port: ${port}`);
});
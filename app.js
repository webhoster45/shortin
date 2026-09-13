require('dotenv').config();
const path=require('path');
const express=require('express');
const mongoose=require('mongoose')
const express=app();

app.use(express.urlencoded({extended:true}));
app.use(express.static('/public'));
app.use(express.json());


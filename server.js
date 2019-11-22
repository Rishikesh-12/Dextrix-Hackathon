var alert= require('alert-node');
var express=require("express"); 
var bodyParser=require("body-parser");
var path = require('path'); 
const fs = require('fs');
var formidable = require('formidable');
var session = require("express-session");
var mongoose = require('mongoose'); 
var bcrypt = require('bcrypt');
const saltRounds = 10;
var reg_post_success = require('./reg_post_success');
mongoose.connect('mongodb://localhost:27017/Rode'); 
var db=mongoose.connection; 
db.on('error', console.log.bind(console, "connection error")); 
db.once('open', function(callback){ 
	console.log("connection succeeded"); 
}) 
var app=express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ 
	extended: true
})); 
app.use('/public',express.static('public')); 
app.use('/css',express.static('css'));
app.use('/js',express.static('js'));
app.use('/img',express.static('img'));
app.use(session({secret:"na1an8vu0ns4eh9ea7t",resave:false,saveUninitialized:true}));


//Registration Start

app.get('/register',function(req,res)
{
    res.sendFile('./public/register.html',{
        root : path.join(__dirname+'/')
    })
});

app.post('/reg-success', function(req,res){ 
	var name = req.body.name;
	var email = req.body.email; 
	var pass = bcrypt.hashSync(req.body.password, 10); 
	var data = { 
		"name": name, 
		"email":email, 
		"password":pass,
	} 
	db.collection('users').findOne({'email':email},function(err, resp){  
		if (err) throw err;
		if(resp)
		{
			console.log("Registration Failed.");
			return res.redirect("/reg-fail");
		}
		else
		{
			db.collection('users').insertOne(data,function(err, collection){ 
				if (err) throw err; 
				console.log("Record inserted Successfully"); 	
			});
			return res.redirect('/reg_post_success'); 
		}
	});
}); 

app.get('/reg_post_success',function(req,res)
{
	res.write(reg_post_success.reg_notify());
});

app.get('/reg-fail',function(req,res)
{
    res.sendFile('./public/reg-fail.html',{
        root : path.join(__dirname+'/')
    })
});

//Registration Stop

//Login Start

app.get('/login',function(req,res)
{
    res.sendFile('./public/login.html',{
        root : path.join(__dirname+'/')
    })
});

app.post('/login-success', function (req, res) {
	db.collection('users').findOne({'email': req.body.email},function (err,user) {
		if (!user) 
		{
			console.log("Login Failed. Due To Incorrect Email.");
			alert("Login UnSuccessful!! Enter Valid Credentials");
			res.redirect("/login");
		}
		else 
		{
			bcrypt.compare(req.body.password, user.password, function (err, result) {
			if (err) throw err; 
			if (result == true) 
			{
				console.log("Login Successful.");
				req.session.user = user;
				console.log("Session Started.");
				res.redirect("/Rode");
			}
			else
			{
				console.log("Login Failed. Due To Incorrect Password.");
				alert("Login UnSuccessfully!! Enter Valid Credentials");
				res.redirect("/login");
			}
	 	});
		}
 	});
});

//Login Stop

//Contribute Page

app.get('/contribute',function(req,res)
{
	if(!req.session.user)
	{
		res.redirect("/error");
	}
    res.sendFile('./public/contribute.html',{
        root : path.join(__dirname+'/')
	})
});

app.post('/submit-contribution', function(req,res){ 
	var name = req.body.name;
	var email = req.body.email; 
	var data = { 
		"name": name, 
		"email":email, 
		"password":pass,
	} 
	db.collection('users').insertOne(data,function(err, collection){ 
	if (err) throw err; 
		console.log("Record inserted Successfully"); 	
	});
	return res.redirect('/contribute');
}); 

//Contribute End

// Index part start

app.get('/Rode',function(req,res)
{
	if(!req.session.user)
	{
		res.redirect("/error");
	}
	res.sendFile('./public/Rode.html',{
        root : path.join(__dirname+'/')
    })
});

// Index part stop

// Logout

app.get('/logout',function(req,res)
{
	req.session.destroy();
	console.log("Session Ended.");
	return res.redirect("/");
});

//Error Page

app.get('/error',function(req,res)
{
    res.sendFile('./public/error.html',{
        root : path.join(__dirname+'/')
    })
});

//Index Page

app.get('/',function(req,res){
res.set({ 
	'Access-control-Allow-Origin': '*'
	}); 
return res.redirect('./public/index.html'); 
}).listen(3000);
console.log("server listening at port 3000"); 

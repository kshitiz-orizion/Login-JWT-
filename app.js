var cors = require('cors');
var morgan=require('morgan');
var express=require('express');
var router=express.Router();
var http=require('http');
var reload = require('reload')
var jwt=require('jsonwebtoken');
var expressJwt=require('express-jwt');
var server=http.createServer();
var path=require('path');
var stringify = require('json-stringify-safe');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var methodOverride=require('method-override');
var jwtSecret = 'kjwdjs65$ikksop0982shj';
var app = express();
app.use(morgan('dev'));
app.use(express.static('../PROJECTS'));

app.use(cors());
app.set('port',process.env.PORT||3000);
app.set('views',__dirname+'views');
app.set('view engine','jade');
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ 
  extended: true
})); 
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/Login';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

});

var RegisterSchema=new mongoose.Schema({
	username:String,
	password:String
})

var register=mongoose.model('register',RegisterSchema);
app.post('/register', function(req, res) {
  var register={
  		username:req.body.username,
  		password:req.body.password
  };
  MongoClient.connect(url,function(err,db){
  	assert.equal(null,err);
  	db.collection('Login').update(register,register,{upsert:true},function(err,result){
  		assert.equal(null,err);
  		console.log("item inserted");
  		db.close();
  	});
  });
});

app.post('/authenticate', function (req, res) {
    console.log('I received a GET request for check');
    MongoClient.connect(url,function(err,db){
    db.collection('Login').findOne({username:req.body.username},function(err,user){
    		if (err) throw err;


    		if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
    	console.log(user.username);
      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
      	console.log(user.password);
        // if user is found and password is right
        // create a token
        var token  = jwt.sign({username:user.username},jwtSecret,{expiresIn:'24h'});
        res.json({success:true, message:'user authenticated', token:token});

        // return the information including token as JSON
        }
    }
    });
});
});


app.listen(3000,function(err,data){
	if(err) throw err;
	else{
		console.log("server running on 3000");
	}
});
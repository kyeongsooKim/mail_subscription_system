
/*In order to use the libraries we made, we use "require" just like "import" in java*/
//library to use HTTP methods like Get, Post, Put, Delete
const express = require('express');
//library to read data from a form
const bodyParser = require('body-parser');
//read all the requests that have been made by users by get or push.
const morgan = require('morgan');
//fetch API from the third party website.
const request = require('request');
const async = require('async');
const expressHbs = require('express-handlebars');//template engine
//memory storage for certain period of time (till server restart)
const session = require('express-session'); 
const MongoStore = require('connect-mongo')(session); //store session to mongoDB
//render message to the user e.g)when you put the wrong emai
const flash = require('express-flash');

//instantiate our express application so we use all the methods that express has.
const app = express(); 

//making the layout
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');

/* use : use one of the libraries above as a middleware
   when we run the server NodeJS will go through all these middleware 
   first before doing other fancy stuff */
//I'm here so that we use this public folder for rendering our local css and js files.
app.use(express.static(__dirname + '/public'));
//I'm here, I could read all the json file in bodyParser library!
app.use(bodyParser.json());
//I'm here so that I can read all the characters that the computer can read(files images, unicode ...)
app.use(bodyParser.urlencoded({extended:false}));
//I'm here so that I can read every request that user has made.
app.use(morgan('dev'));
app.use(session({ //I'm here so that I can use session
				  //session is necessary if you want to use flash()
  resave: true, //force session to be saved to database
  saveUinitialiazed: true, //force uninitialized session to be saved to database
  secret: "kyeongsookim", //sign the session ID cookie
  store: new MongoStore({ url: 'mongodb://root:1234@ds217898.mlab.com:17898/twitter'})
}));
app.use(flash());


app.route('/') //if there are multiple HTTP methods we use app.route('/')
  
	// Get Data from server
	//Requests data from a specified resource (triggered whenever user hit the url)
  .get((req, res, next) => { //parameter "next" is a.k.a callback.

  	/*res.render('main/home'
  	when we make bunch of html files, we don't want to copy and past the same part of code.
	so we inherit our layout page to avoid redundancy.*/ 

	/*res.render({message: req.flash('success'});
	 when you post sth (code below), then req.flash('success', 'You have...email');
	 is triggered and it will be stored in session. then when you went back to
	 this line(refreshed), res.render('main/home', {message: req.flash('success)'});
	 is triggered. Since req.flash() is already saved in session variable "message".
	 you can just use this variable to stick to your html page. */
    res.render('main/home', {message: req.flash('success') });
  })
  //Submits data to server to be processed to a specified resource
  .post((req, res, next) => {
     request({
		/*   to contact API
			 root of API  :  https://us17.api.mailchimp.com/3.0/
			 Endpoint url : /lists/{list_id}/members  */
      url: 'https://us17.api.mailchimp.com/3.0/lists/cc5d3fbe51/members',
      method: 'POST', //what kind of http method we want to do
      headers: { 
      	//we need API Key MailChimp will know that our node server is trying to
		//communicate with this particular account
        'Authorization': 'randomUser abaa69543280851db0808f62d4c84a8f-us17',
        //bodyParser.joson(), we are sending json data
        'Content-Type': 'application/json' 
      },
      json: {

      	//there is a input element named "email" in home.hbs file, and bodyparser
      	//is targeting that element to get the data from it.
        'email_address': req.body.email,
        'status': 'subscribed'
      }
    }, function(err, response, body) { //callback

      if (err) {
        console.log(err);
      } else {
      	req.flash('success', 'You have submitted your email');
        res.redirect('/'); //redirect user to back to the home
      }
    });
  });


app.listen(3025, (err) => {
	if (err){
		console.log(err);
	} else{
		console.log("Running on Port 3025");
	}
});
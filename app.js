const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const sassMiddleware = require('node-sass-middleware');
const hbs = require('express-handlebars');
const autoprefixer = require('autoprefixer');
const postcssMiddleware = require('postcss-middleware');

// For passport (auth)
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');


const Twitter = require('twitter');
const twitterConfig = require('./config/twitter').config;
const twitterClient = new Twitter(twitterConfig);

/** For tasks*/
const cron = require('node-cron');

// task for getting news
const checkNewDataTask = cron.schedule('0 */5 * * * *', getNewData);

/** For database models */
const Sequelize = require('sequelize');


const db = require('./config/db');
const sequelize = new Sequelize(db.name, db.user, db.password, db.config);


/** Import models */
const RssUrl = sequelize.import('./models/rss_urls');
const Source = sequelize.import('./models/sources');
const Category = sequelize.import('./models/categories');
const User = sequelize.import('./models/users');
RssUrl.belongsTo(Source, {foreignKey: 'id_source'});
RssUrl.belongsTo(Category, {foreignKey: 'id_category'});

const President = sequelize.import('./models/presidents');
const Tweet = sequelize.import('./models/tweets');
Tweet.belongsTo(President, {foreignKey: 'id_president'});


const request = require('request');

getNewData();
checkNewDataTask.start();

function getNewData() {
  getRecentNews();
  getRecentTweets();
}

const myRssParser = {
  'korr': require('./functions/rss/korrespondent'),
  'epravda': require('./functions/rss/epravda'),
  'telegraph': require('./functions/rss/telegraph')
};

function getRecentNews() {
  RssUrl.all({ include: [ Source, Category ] }).then(rssUrls => {
    rssUrls.forEach( rssItem =>{
      myRssParser[rssItem.source.alias](rssItem);
      console.log(`Fresh news checked: ${rssItem.category.name} from ${rssItem.source.name}`)
    });
  }).catch(err => {
    console.log(err);
  });
}

function getRecentTweets() {
  President.all().then(presidents => {
    presidents.forEach( p => {
      fetchNewTweetsForPresident(p);
    });
  }).catch(err => {
    console.log(err);
  });
}

function fetchNewTweetsForPresident(president) {
  let params = {screen_name: president.username};
  new Promise((resolve, reject)=>{
    twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (error)
        reject(error);

      resolve(tweets);
    });
  })
  .then(tweets =>{
    tweets.forEach(t=>insertOneTweet(t, president));
  })
  .catch(err=>{
    console.log(err);
  })
}

function insertOneTweet(tweet, president) {

  Tweet.findOrCreate({
    defaults:{
      tweet_id: tweet.id_str,
      text: tweet.text,
      datetime: new Date(tweet.created_at).toLocaleString(),
      lang: tweet.lang,
      id_president: president.id
    },
    where : { tweet_id: tweet.id_str }
  }).spread((dbTweet, created)=>{
    if(!created) return;
    console.log(`Tweet Added: ${dbTweet.id} at ${dbTweet.createdAt}`)
  })
  .catch(err=>{
    console.log(`FAILED TO ADD TWEET of ${president.name}, published at: ${tweet.created_at}`);
  })
}

// Routes
const index = require('./routes/index');
const user = require('./routes/user');
const auth = require('./routes/auth');
const search = require('./routes/search');
const newsPage = require('./routes/newsPage');
const feed = require('./routes/feed');
const categories = require('./routes/categories');
const app = express();

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** For passport */
app.use(session({secret: 'Lisa 13 orange 13 pizza 13 ice cream 13 nails', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session()); // постоянные сессии входа (persistent login sessions)

//load passport strategies
require('./config/passport/passport.js')(passport, User);


app.use(cookieParser());

// for passport flash ( send message of login/register fail )
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', index);
app.use('/user', user);
app.use('/auth', auth);
app.use('/search', search);
app.use('/news', newsPage);
app.use('/feed', feed);
app.use('/categories', categories);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

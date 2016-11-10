require('console-stamp')(console, '[HH:MM:ss.l]');
var oauth2orize = require('oauth2orize');
var utils = require('./js/utils');
var randtoken = require('rand-token');
var crypto = require('crypto');
var passport = require('passport');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var MongoClient = require('mongodb').MongoClient;
var login = require('connect-ensure-login');
var util = require('util');
var bcrypt = require('bcrypt');
var jade = require('jade');
var async = require('async');
var helmet = require('helmet');
var CMD = require('./js/common-const').cmd;
var fs = require('fs');
var execFile = require('child_process').execFile;
var execFileSync = require('child_process').execFileSync;

var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var nodemailer = require('nodemailer');

var GLOBAL = {
  serverAddress: 'http://164.125.70.62',
  serverPort: 3000,
  mongoStoreOptions: {
    ttl: 60 * 60 * 24 * 7,
    autoRemove: true,
    url: 'mongodb://localhost:27017/zolgwa-oauth2'
  },
  smtpConfig: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: '',
      pass: ''
    }
  },
  APIKEY_LENGTH: 16, 
  CSV_ROOT: __dirname + /csv/,
  db: null
};

var mongoUrl = 'mongodb://localhost:27017/zoldata2';

var DB_NAME = {
  SESSION: 'zolgwa',
  REALDB: 'zoldata' 
};

var TABLE_NAME = {
  USER: 'user',
  CLIENT: 'client',
  AUTHORIZATION_CODE: 'authorization_code' ,
  ACCESS_TOKEN: 'access_token',
  API: 'api',
  EMAIL_TOKEN: 'email_token'
};


var app = express();
var transporter = nodemailer.createTransport(GLOBAL.smtpConfig);
app.use(cookieParser());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(session({
  domain: '.app.localhost',
  secret: 'zolgwa2',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore(GLOBAL.mongoStoreOptions),
  name: 'connect.auth'
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }
});
var server = oauth2orize.createServer();

function printError(err) {
  return console.error(err);
}

function cryptPassword(password, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) 
      return callback(err);
    bcrypt.hash(password, salt, function(err, hash) {
      return callback(err, hash);
    });
  });
}

function comparePassword(password, userPassword, callback) {
  bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
    if (err)
      return callback(err);
    return callback(null, isPasswordMatch);
  });
}

function jadeRead(res, p, varlist) {
  var fn = jade.compileFile(__dirname + p, {
      basedir: __dirname
  });
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(fn(varlist));
}

var passportLogin = function(userId, password, passportDone) {
  async.waterfall([
    function(done) {
      GLOBAL.db.collection(TABLE_NAME.USER).findOne({id: userId}, function(err, doc) {
        if (err) return printError(err);
        console.log(doc);
        if (doc) {
          if (doc.valid) {
            return done(null, doc.password);  
          } else {
            return passportDone(null, false, {
              succes: false,
              message: '이메일인증을 하지 않은 아이디입니다.'
            });
          }
        } else {
          return passportDone(null, false, {
            success: false,
            message: '존재하지 않는 아이디입니다.'
          });
        }
      });
    }, function(userPassword, done) {
      comparePassword(password, userPassword, function(err, matched) {
        if (err) return printError(err);
        if (matched) {
          return passportDone(null, {
            id: userId
          }, {
            success: true
          });
        }
        return passportDone(null, false, {
          success: false,
          message: '비밀번호가 틀립니다.'
        });
      });
    }
  ]);
};

passport.serializeUser(function(user, done) {
  console.log('serialize user');
  return done(null, user.id);  
});

passport.deserializeUser(function(id, done) {
  console.log('deserialize user');
  GLOBAL.db.collection(TABLE_NAME.USER).findOne({id: id}, function(err, doc) {
    if (err) return printError(err);
    return done(err, doc);
  });
});

app.use(helmet());

server.serializeClient(function(client, done) {
  console.log('serializeClient', client);
  return done(null, client._id);
});

server.deserializeClient(function(id, done) {
  console.log('deserializeClient');
  GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({_id: id}, function (err, client) {
    if (err) return done(err);
    return done(null, client);
  });
});

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  console.log('grant code');
  console.log('Client: ', client);
  console.log('RedirectURI: ', redirectURI);
  console.log('User: ' , user);
  
  var now = new Date().getTime();
  var code = crypto.createHmac('sha1', 'access_token')
    .update([client.id, now].join())
    .digest('hex');
    
  var id = user ? user.id : null;
  GLOBAL.db.collection(TABLE_NAME.AUTHORIZATION_CODE).insertOne({
    code: code,
    client_id: client.client_id,
    redirect_uri: redirectURI,
    user_id: id,
    scope: ares.scope
  }, function(err, doc)   {
    if (err) return done(err);  
    return done(null, code);
  });
}));
  
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  console.log('exchange code');
  console.log('Client: ', client);
  console.log('Code: ', code);
  
  GLOBAL.db.collection(TABLE_NAME.AUTHORIZATION_CODE).findOne({code: code}, function(err, code) {
    if (err) return done(err);
    if (!code) return done(null, false);
    if (client.client_id.toString() !== code.client_id.toString()) return done(null, false);
    if (redirectURI !== code.redirect_uri) return done(null, false);
    var now = new Date().getTime();
    var token = crypto.createHmac('sha1', 'access_token')
        .update([client.id, now].join())
        .digest('hex');
    GLOBAL.db.collection(TABLE_NAME.ACCESS_TOKEN).insertOne({
      oauth_token: token,
      user_id: code.user_id,
      client_id: code.client_id,
      scope: code.scope
    }, function(err) {
      if (err) return done(err);
      return done(null, token);
    });
  });
}));

server.grant(oauth2orize.grant.token(function(client, user, ares, done) {
  console.log('grant token');
  console.log('Client: ', client);
  console.log('User: ', user);
  var token = utils.uid(256);
  GLOBAL.db.collection(TABLE_NAME.ACCESS_TOKEN).insertOne({
    oauth_token: token,
    user_id: user.id,
    client_id: client.client_id,
    scope: ares.scope
  }, function(err, doc) { 
    if (err) return done(err);
    return done(null, token);   
  });
}));

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
  console.log('exchange password');
  GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({
    client_id: client.client_id
  }, function(err, localClient) {
    if (err) { return done(err); }
    if(localClient === null) {
      return done(null, false);
    }
    if(localClient.client_secret !== client.client_secret) {
      return done(null, false);
    }
    //Validate the user
    GLOBAL.db.collection(TABLE_NAME.USER).findOne({
      user_id: username  
    }, function(err, user) { 
      if (err) { return done(err); }
      if(user === null) {
        return done(null, false);
      }
      if(password !== user.password) {
        return done(null, false);
      }
      //Everything validated, return the token
      var token = utils.uid(256);
      GLOBAL.db.collection(TABLE_NAME.ACCESS_TOKEN).insertOne({
        oauth_token: token,
        user_id: user.user_id,
        client_id: client.client_id
      }, function(err) {
        if (err) { return done(err); }
        return done(null, token);
      });
    });
  });
}));

server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {
  console.log('client credentials');
  GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({
    client_id: client.client_id
  }, function(err, localClient) {
    if (err) { return done(err); }
    if(localClient === null) {
      return done(null, false);
    }
    if(localClient.client_secret !== client.client_secret) {
      return done(null, false);
    }
    var token = utils.uid(256);
    //Pass in a null for user id since there is no user with this grant type
    GLOBAL.db.collection(TABLE_NAME.ACCESS_TOKEN).insertOne({
      oauth_token: token,
      user_id: null,
      client_id: client.client_id
    }, function(err) {
      if (err) return done(err); 
      return done(null, token);
    });
  });
}));


app.all('/*', function(req, res, next) {
  console.log(req.method, req.originalUrl);
  next();
});

app.get('/login', function(req, res, next) {
  return jadeRead(res, '/jade/login.jade', {user: req.user});
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) return printError(err);
    if (user) {
      req.login(user, function(err) {
        if (err)
          return printError(err);
        return res.json(info);
      });
    } else {
      return res.json(info);
    }
  })(req, res, next);
});

app.get('/test', function(req, res, next){
    // authorizationURL: 'http://164.125.70.62:3000/auth',
    // tokenURL: 'http://164.125.70.62:3000/token',
    // clientID: '123-456-789',
    // clientSecret: 'shhh-its-a-secret',
    // callbackURL: 'http://164.125.70.62:8080/oauth2/callback'
  // GLOBAL.db.collection(TABLE_NAME.CLIENT).remove({
  //   client_id: '123-456-789'  
  // }, function(err) {
  //   console.log(err); 
  //   console.log('good');
  // });
  // GLOBAL.db.collection(TABLE_NAME.CLIENT).insertOne({
  //   id: '1',
  //   name: 'app',
  //   client_id: '123-456-789',
  //   client_secret: 'shhh-its-a-secret',
  //   redirect_uri: 'http://164.125.70.62:8080/oauth2/callback'
  // }, function(err) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   return console.log('good');
  // });
  
  // GLOBAL.db.collection(TABLE_NAME.USER).updateOne({
  //   id: 'admin'
  // }, {$set:{email: '4dimensionn@naver.com'}}, function(err, doc) {
  //   if (err) return;
  //   console.log(err, doc);
  // });
});

app.post('/logout', 
  login.ensureLoggedIn('/login'),
  function(req, res, nxt) {
    req.logout();  
    return res.json({
      success: true
    });
  });

app.get('/signup', login.ensureLoggedOut(), function(req, res, next) {
  if(req.user) return res.redirect('/');
  return jadeRead(res, '/jade/signup.jade', {
  });
});

app.post('/signup', login.ensureLoggedOut(), function(req, res, next) {
  var body = req.body;
  //email, name, password, confirm
  if (body.email.length > 50) return res.redirect('/');
  if (body.user_id.length > 50) return res.redirect('/');
  if (body.password.length  > 100) return res.redirect('/');
  GLOBAL.db.collection(TABLE_NAME.USER).findOne({
    $or:[
      {email:body.email},
      {id:body.user_id}]}, function(err, doc) {
    if (err) {
      return res.json({
        success: false,
        message: err
      });
    }
    if (doc) {
      return res.json({
        success: false,
        message: 'already exists'
      });
    } else {
      var token = randtoken.uid(GLOBAL.APIKEY_LENGTH);
      var userEmail = body.email;
      var mailSubject = '회원가입 인증 메일입니다.';
      var mailContent = body.user_id + 
          '님 가입하신 것을 환영합니다. ' +
          '<a href =\'' + GLOBAL.serverAddress + '/eauth?q=' +
          token + '\'>인증</a>';
      var mailData = {
        from: 'aoj.service@gmail.com',
        to: userEmail,
        subject: mailSubject,
        html: mailContent
      };
      transporter.sendMail(mailData, function(err, info) {
        if (err) {
          console.error(err);
          return res.json({
            success: false,
            message: err
          });
        }
        GLOBAL.db.collection(TABLE_NAME.EMAIL_TOKEN).insertOne({
          token: token,
          id: body.user_id
        });
        cryptPassword(body.password, function(err, hash) {
          if (err) {
            console.error(err);
            return res.json({
              success: false,
              message: err
            });
          } 
          GLOBAL.db.collection(TABLE_NAME.USER).insertOne({
            id: body.user_id,
            email: body.email,
            password: hash,
            valid: false
          }, function(err, r) {
            if (err) {
              console.error(err);
              return res.json({
                success: false,
                message: err
              });
            }
            return res.json({
              success: true
            });
          });
        });
      });
    }
  });
});

app.get('/eauth', login.ensureLoggedOut(), function(req, res) {
  var token = req.query.q; 
  GLOBAL.db.collection(TABLE_NAME.EMAIL_TOKEN).findOne({
    token: token
  }, function(err, doc) {
    if (err) {
      return printError(err);
    }
    
    GLOBAL.db.collection(TABLE_NAME.USER).updateOne({
      id: doc.id
    }, {
      $set: {valid: true}
    }, function(err) {
      if (err) {
        return printError(err);
      }
      return res.redirect('/login');
    });
  });
});


app.get('/auth', [
  function(req, res, next) {
    console.log(req);
    console.log(req.query);
    var redirectURI = '/login?redirect_uri=' + req.query.redirect_uri || '/login';
    console.log(redirectURI);
    return login.ensureLoggedIn(redirectURI)(req, res, next);
  },
  server.authorization(function(clientID, redirectURI, done) {
    console.log('authorization');
    console.log('ClientID: ', clientID);
    console.log('RedirectURI: ', redirectURI);
    GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({
      client_id: clientID    
    }, function(err, doc) {
      if (err) return done(err); 
      return done(null, doc, redirectURI);
    });
  },
  function(client, user, done) {
    console.log(client, user);
    return done(null, true);
  }),
  function(req, res) {
    return res.json({
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
]);

app.get('/api/auth', [
  server.authorization(function(clientID, redirectURI, done) {
    GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({
      client_id: clientID    
    }, function(err, doc) {
      if (err) return done(err); 
      if (doc.redirect_uri != redirectURI) return done(null, false);
      return done(null, doc, redirectURI);
    });
  },
  function(client, user, done) {
    return done(null, true);
  }),
  function(req, res) {
    return res.json({
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
]);

app.get('/auth/decision', 
  login.ensureLoggedIn(),
  server.decision());
  
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password'
  },
  passportLogin
));

passport.use(new BasicStrategy(
  function (username, password, done) {
    console.log('basic Strategy');
    GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({
    }, function(err, client) {
      if (err) return done(err);
      if (!client) return done(null, false);
      if (client.secret != password) return done(null, false);
      return done(null, client); 
    });
  }
));



passport.use('oauth2-client-password-user', new ClientPasswordStrategy(
  function(clientId, clientSecret, done) {
    console.log('oauth2-client-password Strategy');
    GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({
      client_id: clientId
    }, function(err, client) {
      if (err) return done(err);  
      if (!client) return done(null, false);
      if (client.client_secret != clientSecret) return done(null, false);
      return done(null, client);
    });
  }
));

passport.use('oauth2-cilent-password-api', new ClientPasswordStrategy(
  function(clientId, clientSecret, done) {
    GLOBAL.db.collection(TABLE_NAME.CLIENT).findOne({
      client_id: clientId
    }, function(err, client) {
      if (err) return done(err);  
      if (!client) return done(null, false);
      if (client.client_secret != clientSecret) return done(null, false);
      return done(null, client);
    });
  }
));

passport.use(new BearerStrategy(
  function (accessToken, done) {
    GLOBAL.db.collection(TABLE_NAME.ACCESS_TOKEN).findOne({
      oauth_token: accessToken
    }, function(err, token) {
      if (err) return done(err);
      if (!token) return done(null, false);
      GLOBAL.db.collection(TABLE_NAME.USER).findOne({
        id: token.user_id
      }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);
        var info = {scope: '*'};  
        return done(null, user, info);
      });
    });
  }
));

passport.use('bearer-api', new BearerStrategy(
  function (accessToken, done) {
    GLOBAL.db.collection(TABLE_NAME.ACCESS_TOKEN).findOne({
      oauth_token: accessToken
    }, function(err, token) {
      if (err) return done(err);
      if (!token) return done(null, false);
      GLOBAL.db.collection(TABLE_NAME.USER).findOne({
        id: token.user_id
      }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);
        var info = {scope: '*'};  
        return done(null, user, info);
      });
    });
  }
));

app.post('/api/request', passport.authenticate('bearer', {session: false}), function(req, res) {
  var body = req.body;
  var exePy = CMD[body.method];
  if (!exePy) {
    return res.json({
      err: '지원하지 않는 method입니다.'  
    });
  }
  var randNum = randtoken.uid(GLOBAL.APIKEY_LENGTH);
  var inp = body.inp;
  var keys = [];
  var values = [];
  for (var key in inp) {
    keys.push(key);
    values.push(inp[key]);
  }
  var inpStr = keys.join(',') + '\n' + values.join(',');
  console.log(inpStr);
  fs.writeFile(__dirname + '/data/' + body.apiKey + '/request/' + randNum + '.csv', inpStr, 'utf-8', function(err, result) {
    if (err) {
      printError(err);
      return res.json({
        err: err
      });
    }      
    var exeParam = [__dirname + '/py/' + exePy + '/request_' + exePy + '.py', body.apiKey, randNum];
    exeParam.push(randNum);
    execFile('python', exeParam, function(err, stdout, stderr) {
      console.log(err);
      console.log(stdout);
      console.log(stderr);
      fs.readFile(__dirname + '/data/' + exePy + '/request/' + randNum + '.req', 'utf-8', function(err, result) {
        if (err) {
          return res.json({
            success: false,
            err: err
          });
        }
        return res.json({
          success: true,
          data: result
        });
      });
    });
  });
});

app.get('/api/me',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    return res.json(req.user);
  });
  
app.post('/token', [
  passport.authenticate(['basic', 'oauth2-client-password-user']),
  server.token(),
  server.errorHandler()
]);

app.post('/api/token', [
  passport.authenticate(['oauth2-client-password-api']),
  server.token(),
  server.errorHandler()
]);

MongoClient.connect(mongoUrl, function(err, db) {
  if (err) {
    return printError(err);
  }
  console.log('Mongo client connected');
  GLOBAL.db = db;
  app.listen(3000, function() {
    console.log(util.format('Auth Server is running. %s:%d', 
      GLOBAL.serverAddress, 3000));
  });
});

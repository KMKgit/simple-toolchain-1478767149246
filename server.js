require('console-stamp')(console, '[HH:MM:ss.l]');
var express = require('express');
var http = require('http');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');
var jade = require('jade');
var url = require('url');
var async = require('async');
var passport = require('passport');
var util = require('util');
var helmet = require('helmet');
var csvParse = require('csv-parse');
var execFile = require('child_process').execFile;
var execFileSync = require('child_process').execFileSync;
var randtoken = require('rand-token');
var formidable = require('formidable');
var login = require('connect-ensure-login');
var ZolgwaStrategy = require('passport-zolgwa');
var CMD = require('./js/common-const').cmd;


var GLOBAL = {
  serverAddress: 'http://164.125.70.62',
  serverPort: 8080,
  mongoStoreOptions: {
    ttl: 60 * 60 * 24 * 7,
    autoRemove: true,
    url: 'mongodb://localhost:27017/zolgwa'
  },
  APIKEY_LENGTH: 16, 
  CSV_ROOT: __dirname + /csv/,
  db: null
};



var DB_NAME = {
  SESSION: 'zolgwa',
  REALDB: 'zoldata' 
};

var TABLE_NAME = {
  USER: 'user2',
  TRAIN_DATA: 'train_data',
  TRAIN_OUTPUT: 'train_output',
  API: 'api'
};

var ACCEPTED_EMAIL = ['@gmail.com'];
var mongoUrl = 'mongodb://localhost:27017/zoldata2';

var app = express();
var server = http.createServer(app);

function printError(err) {
  return console.error(err);
}

function printRequestLog(request) {
  return console.log(request.method, request.originalUrl);
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

// function comparePassword(password, userPassword, callback) {
//   bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
//     if (err)
//       return callback(err);
//     return callback(null, isPasswordMatch);
//   });
// }

function jadeRead(res, p, varlist) {
  var fn = jade.compileFile(__dirname + p, {
      basedir: __dirname
  });
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(fn(varlist));
}

function dateFormat(data) {
  var len = data.length;
  function mask(x) {
    x = x.toString();
    if (x.length <= 1) return '0' + x;
    return x;
  }
  for (var i = 0; i < len; ++i) {
    var date = new Date(data[i].write_time);    
    data[i].write_time = util.format("%s-%s-%s %s:%s",
        date.getFullYear(),
        mask(date.getMonth() + 1),
        mask(date.getDay()),
        mask(date.getHours()),
        mask(date.getMinutes()));
  }
  return data;
}

passport.use('oauth2', new ZolgwaStrategy({
    authorizationURL: 'http://164.125.70.62:3000/auth',
    tokenURL: 'http://164.125.70.62:3000/token',
    clientID: '123-456-789',
    clientSecret: 'shhh-its-a-secret',
    callbackURL: 'http://164.125.70.62:8080/oauth2/callback',
    profileURL: 'http://164.125.70.62:3000/api/me',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    console.log('get access_token');
    console.log('access_token: ', accessToken);
    GLOBAL.db.collection(TABLE_NAME.USER).findOne({
      id: profile.id,
    }, function(err, doc) { 
      if (err) return done(err);
      if (doc) {
        doc.access_token = accessToken;
        return done(null, doc); 
      } else {
        GLOBAL.db.collection(TABLE_NAME.USER).insertOne({
          id: profile.id,
          email: profile.email
        }, function(err, doc) {
          if (err) return done(err);
          doc.access_token = accessToken;
          return done(null, doc);
        });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  console.log('serialize user');
  console.log('User: ', user);
  return done(null, user);  
});

passport.deserializeUser(function(profile, done) {
  console.log('deserialize user');
  console.log('Profile: ' , profile);
  GLOBAL.db.collection(TABLE_NAME.USER).findOne({id: profile.id}, function(err, doc) {
    if (err) return printError(err);
    return done(err, doc);
  });
});

app.use(helmet());
app.use(express.static(__dirname));
app.use(cookieParser());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(session({
  domain: '.app.localhost',
  secret: 'zolgwa',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore(GLOBAL.mongoStoreOptions)
}));

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
app.use(passport.initialize());
app.use(passport.session());


app.all('/*', function(req, res, next) {
  printRequestLog(req);
  next();
});
app.get('/', function(req, res, next) {
  if (!req.user) {
    return jadeRead(res, '/jade/index.jade', {});
  } else {
    var id = req.user.id; 
    async.parallel([
      function countTrue(callback) {
        GLOBAL.db.collection(TABLE_NAME.API).find({user_id: id, valid: 1}).count(function(err, count) {
          if (err) {
            printError(err);
            return jadeRead(res, '/jade/index.jade', {
              user: req.user
            });
          }
          return callback(null, count);
        });
      },
      function countFalse(callback) {
        GLOBAL.db.collection(TABLE_NAME.API).find({user_id: id, valid: 0}).count(function(err, count) {
          if (err) {
            printError(err);
            return jadeRead(res, '/jade/index.jade', {
              user: req.user
            });
          }
          return callback(null, count);
        });
      },
      function countErr(callback) {
        GLOBAL.db.collection(TABLE_NAME.API).find({user_id: id, valid: -1}).count(function(err, count) {
          if (err) {
            printError(err);
            return jadeRead(res, '/jade/index.jade', {
              user: req.user
            });
          }
          return callback(null, count);
        });
      }
    ],
    function done(err, results) {
      if (err) {
        printError(err);
        return jadeRead(res, '/jade/index.jade', {
          user: req.user
        });
      }
      return jadeRead(res, '/jade/index.jade', {
        user: req.user,
        successCount: results[0],
        learningCount: results[1],
        errCount: results[2]
      });
    });
  }
});

app.get('/oauth2/callback',
  passport.authenticate('oauth2', {failureRedirect: '/'}),
  function(req, res, next) {
    return res.redirect('/');
  });

app.get('/signup', login.ensureLoggedOut(), function(req, res, next) {
  if(req.user) return res.redirect('/');
  return jadeRead(res, '/jade/signup.jade', {
  });
});

app.get('/logout', login.ensureLoggedIn(), function(req, res, next) {
  console.log("LOGOUT");
  req.logout();
  res.redirect('/');
});

app.get('/createapi', login.ensureLoggedIn(),
  function(req, res, next) { 
    // if (!req.user) return res.redirect('/');
    return jadeRead(res, '/jade/createapi.jade', {
      user: req.user
    });
  });

app.get('/errapi', login.ensureLoggedIn(), function (req, res, next) {
  if (!req.user) return res.redirect('/');
  
  GLOBAL.db.collection(TABLE_NAME.API).find({user_id: req.user.id, valid:-1}).toArray(function(err, doc) {
    if (err) return printError(err);
    
    var ENTRY_PER_PAGE = 10;
    var maxPage = Math.max(1, Math.floor((doc.length - 1) / ENTRY_PER_PAGE + 1));
    console.log(maxPage);
    return jadeRead(res, '/jade/errapi.jade', {
      user: req.user,
      //errapis: dateFormat(doc),
      errapis: 0,
      maxPage: maxPage
    });
  }); 
});

app.get('/successapi', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) return res.redirect('/');
  
  GLOBAL.db.collection(TABLE_NAME.API).find({user_id: req.user.id, valid:1}).toArray(function(err, doc) {
    if (err) return printError(err);
    
    var ENTRY_PER_PAGE = 10;
    var maxPage = Math.max(1, Math.floor((doc.length - 1) / ENTRY_PER_PAGE + 1)); 
    console.log(maxPage);
    return jadeRead(res, '/jade/successapi.jade', {
      user: req.user,
      successapis: dateFormat(doc),
      maxPage: maxPage
    });
  }); 
});

app.get('/learningapi', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) return res.redirect('/');
  
  GLOBAL.db.collection(TABLE_NAME.API).find({user_id: req.user.id, valid:0}).toArray(function(err, doc) {
    if (err) return printError(err);
    console.log(doc)
    var ENTRY_PER_PAGE = 10;
    var maxPage = Math.max(1, Math.floor((doc.length - 1) / ENTRY_PER_PAGE + 1)); 
    console.log(maxPage);
    return jadeRead(res, '/jade/learningapi.jade', {
      user: req.user,
      learningapis: dateFormat(doc),
      maxPage: maxPage
    });
  }); 
});

app.get('/myapi', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) return res.redirect('/');
  
  GLOBAL.db.collection(TABLE_NAME.API).find({user_id: req.user.id}).toArray(function(err, doc) {
    if (err) return printError(err);
    
    var ENTRY_PER_PAGE = 10;
    var maxPage = Math.max(1, Math.floor((doc.length - 1) / ENTRY_PER_PAGE + 1)); 
    console.log(maxPage);
    return jadeRead(res, '/jade/myapi.jade', {
      user: req.user,
      myapis: dateFormat(doc),
      maxPage: maxPage
    });
  }); 
});

app.get('/api', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) res.redirect('/');
  
  var aid = req.query.aid;
  if (!aid) return res.redirect('/myapi');
  GLOBAL.db.collection(TABLE_NAME.API).findOne({api_key: aid}, function(err, doc) {
    if (err || !doc) {
      return res.redirect('/')  ;
    }
    console.log(doc);
  
    return jadeRead(res, '/jade/api.jade', {
      user: req.user,
      api: doc
    });
  });
});

app.get('/api/info', login.ensureLoggedIn(), function(req, res, next) {
  
  var aid = req.query.aid;
  if (!aid) return res.redirect('/myapi');
  GLOBAL.db.collection(TABLE_NAME.API).findOne({
    api_key: aid
  }, function(err, doc) {
    if (err) {
      return res.send(err);
    }
    return res.send(doc.params);
  });
});

app.get('/api/err', login.ensureLoggedIn(), function(req, res, next) {
  var aid = req.query.aid;
  if (!aid) return res.redirect('/myapi');
  GLOBAL.db.collection(TABLE_NAME.API).findOne({
    api_key: aid
  }, function(err, doc) {
    if (err) {
      return res.send(err);
    }
    return res.json({
      err: doc.err
    });
  });
});



app.get('/login',
  passport.authenticate('oauth2')
);

app.post('/api/info', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) {
    return res.redirect('/');
  }
  
  var body = req.body;
  GLOBAL.db.collection(TABLE_NAME.API).findOne({api_key: body.apiKey}, function(err, doc) {
    if (err) {
      printError(err);
      return res.json({
        err: err
      });
    }
    return res.json({
      doc: doc
    });
  });
});

app.post('/test_upload', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) res.redirect('/');
  
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.uploadDir = __dirname + '/csv/';
  
  var randomApikey = randtoken.uid(GLOBAL.APIKEY_LENGTH);
  var body = {};
  form.parse(req);
  form.on('progress', function(bytesReceived, bytesExpected) { 
    console.log(bytesReceived, bytesExpected);
  });
  form.on('field', function(name, value) {
    body[name] = JSON.parse(value);
    console.log(name, util.inspect(value));
  });
  
  form.on('fileBegin', function(name, value) {
    console.log('filebegin');
    execFileSync('mkdir', ['-p', __dirname + '/data/' + randomApikey]);
    execFileSync('mkdir', ['-p', __dirname + '/data/' + randomApikey + '/test']);
    execFileSync('mkdir', ['-p', __dirname + '/data/' + randomApikey + '/request']);
    value.path = __dirname + '/data/' + randomApikey + '/' + randomApikey + '.csv';
    value.type = 'text/csv';
  }); 
  
  form.on('file', function(name, value) {
  });
   
  form.on('error', function(err) {
    console.log(err);
  });
  
  form.on('aborted', function() {
    console.log('aborted');
  });
  
  form.on('end', function() {
    console.log(body);
    var columnsWithTypes = body.columns.map(function(val, idx) {
      return {column: body.columns[idx], types: body.types[idx]};
    });
    fs.writeFileSync(__dirname + '/data/' + randomApikey + '/' + randomApikey + '.info', JSON.stringify(columnsWithTypes));
    fs.writeFileSync(__dirname + '/data/' + randomApikey + '/' + randomApikey + '.param', JSON.stringify(body.params));
    console.log('end');
    var newData = {
      user_id: req.user.id,
      api_key: randomApikey,
      api_name: body.apiName,
      valid: 0,
      method: body.method,
      write_time: body.writeTime,
      params: body.params,
      err: ''
    };
    GLOBAL.db.collection(TABLE_NAME.API).insertOne(newData, function(err, doc) {
      if (err) {
        console.log(err);
        return res.json({
          err: err
        });
      }
      var exePy = CMD[body.method];
      var exeParam = [__dirname + '/py/' + exePy + '/' + exePy + '.py'];
      exeParam.push(randomApikey);
      execFile('python', exeParam, function(err, stdout, stderr) {
        if (err) {
          return printError(err);  
        }
        console.log('stdout', stdout);
        console.log('stderr', stderr);
        if (stderr) {
          GLOBAL.db.collection(TABLE_NAME.API).updateOne({api_key: randomApikey},
            {$set:{valid:-1, err: stderr}}, function(err, doc) {
            if (err) {
              return printError(err);
            }       
          });     
        } else {
          GLOBAL.db.collection(TABLE_NAME.API).updateOne({api_key: randomApikey}, {$set:{valid: 1}}, function(err, doc) {
            if (err) {
              return printError(err);
            } 
          });
        }
      });
    });
    return res.json({
      message: 'end'
    });
  });
});945678,l;

app.post('/test', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) return res.redirect('/');
  
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.uploadDir = __dirname + '/csv/';
  
  var randomTestNumber = randtoken.uid(GLOBAL.APIKEY_LENGTH);
  var body = {};
  form.parse(req);
  form.on('progress', function(bytesReceived, bytesExpected) { 
    console.log(bytesReceived, bytesExpected);
  });
  form.on('field', function(name, value) {
    body[name] = JSON.parse(value);
    console.log(name, util.inspect(value));
  });
  
  form.on('fileBegin', function(name, value) {
    execFileSync('mkdir', ['-p', __dirname + '/data/' + body.apiKey + '/test']);
    value.path = __dirname + '/data/' + body.apiKey + '/test/' + randomTestNumber + '.csv';
    value.type = 'text/csv';
    console.log('filebegin');
  }); 
  
  form.on('file', function(name, value) {
  });
   
  form.on('error', function(err) {
    console.log(err);
  });
  
  form.on('aborted', function() {
    console.log('aborted');
  });
  
  form.on('end', function() {
    async.waterfall([
      function(done) {
        GLOBAL.db.collection(TABLE_NAME.API).findOne({api_key: body.apiKey},
            function(err, doc) {
          if (err) {
            console.error(err);
            return res.json({
              err: err  
            });
          }      
          done(null);
        });
      },
      function(done) {
        console.log(body);
        if (body.columns) {
          var columnsWithTypes = body.columns.map(function(val, idx) {
            return body.columns[idx] + '\n' + body.types[idx];      
          });
          var columnsInfo = columnsWithTypes.join('\n');
          fs.writeFileSync(__dirname + '/data/' + body.apiKey + '/test/' + randomTestNumber + '.info', columnsInfo);
        }
        if (body.params)
          fs.writeFileSync(__dirname + '/data/' + body.apiKey + '/test/' + randomTestNumber + '.param', JSON.stringify(body.params));
        
        console.log('end');
        var exePy = CMD[body.method];
        var exeParam = [__dirname + '/py/' + exePy + '/test_' + exePy + '.py'];
        exeParam.push(body.apiKey);
        exeParam.push(randomTestNumber);
        execFile('python', exeParam, function(err, stdout, stderr) {
          console.log(err); 
          console.log(stdout);
          console.log(stderr);
          
          fs.readFile(__dirname + '/data/' + body.apiKey + '/test/' + randomTestNumber + '.test', 'utf-8', function(err, result) {
            if (err) {
              printError(err);
              return res.json({
                err: err
              });
            }
            console.log(result);
            return res.json({
              data: result
            });
          });
        });
      }
    ]);
  });
});


app.post('/run', function(req, res, next) {
  var body = req.body;
  console.log(body);
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
      if (stderr) {
        return res.json({
          err: stderr
        });
      }
      fs.readFile(__dirname + '/data/' + body.apiKey + '/request/' + randNum + '.req', 'utf-8', function(err, result) {
        if (err) {
          return res.json({
            err: err
          });
        }
        return res.json({
          data: result
        });
      });
    });
  });
});

app.post('/remove', login.ensureLoggedIn(), function(req, res, next) {
  if (!req.user) {
    return res.redirect('/');
  }

  var list = req.body.rmList;
  
  async.each(list, function(apiKey, callback) {
    GLOBAL.db.collection(TABLE_NAME.API).remove({api_key: apiKey}, function(err, n) {
      if (err) {
        printError(err);
        return res.json({
          err: err
        });
      }
      execFile('rm', ['-f', apiKey + '.*'], function(err, stdout, stderr) {
        if (err) {
          printError(err);
          return res.json({
            err: err
          });
        }
        return callback(null);
      });
    });
  },
  function(err) {
    if (err) {
      return res.json({
        err: err
      });
    }
    
    return res.json({
      success: true
    });
  });
});

app.post('/search', login.ensureLoggedIn(), function(req, res, next) {
  var body = req.body;
  if (!req.user) {
    return res.redirect('/');
  }
  
  function getFailureFunction(name) {
    var ff = [];
    var len = name.length;
    for (var i = 0; i < len; ++i) ff.push(0);
    
    var m = 0;
    for (var i = 1; i < len; ++i) {
      while (m > 0 && name[i] != name[m]) m = ff[m - 1];
      if (name[i] == name[m]) ++m;
      ff[i] = m;
    }
    return ff;
  }
  
  function KMP(H, N, ff) {
    var m = 0;
    for (var i = 0; i < H.length; ++i) {
      while (m > 0 && H[i] != N[m]) m = ff[m - 1];  
      if (H[i] == N[m]) ++m;
      if (m == N.length) return true;
    }
    return false;
  }
  
  GLOBAL.db.collection(TABLE_NAME.API)
      .find({user_id: req.user.id})
      .toArray(function(err, doc) {
    if (err) {
      printError(err);
      return res.redirect('/');
    }
    
    var data = [];
    var len = doc.length;
    var ff = getFailureFunction(body.word);
    for (var i = 0; i < len; ++i) {
      var name = doc[i].api_name;
      if (KMP(name, body.word, ff)) data.push(doc[i]);
    }
    
    return res.json({
      data: dateFormat(data)
    });
  });
});

app.post('/data_init', function(req, res, next) {
  if (!req.user) return res.redirect('/');
  GLOBAL.db.collection(TABLE_NAME.API).find({user_id: req.user.id}).toArray(function(err, doc) {
    if (err) return printError(err);
    return res.json({
      data: dateFormat(doc)
    });
  }); 
});

app.post('/signup', login.ensureLoggedOut(), function(req, res, next) {
  if (!req.user) return res.redirect('/');
  var body = req.body;
  //email, name, password, confirm
  if (body.email.length > 50) return res.redirect('/');
  if (body.user_id.length > 50) return res.redirect('/');
  if (body.password.length  > 100) return res.redirect('/');
  GLOBAL.db.collection(TABLE_NAME.USER).findOne({
    $or:[
      {email:body.email},
      {user_id:body.user_id}]}, function(err, doc) {
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
      cryptPassword(body.password, function(err, hash) {
        if (err) {
          return res.json({
            success: false,
            message: err
          });
        } 
        GLOBAL.db.collection(TABLE_NAME.USER).insertOne({
          user_id: body.user_id,
          email: body.email,
          password: hash
        }, function(err, r) {
          console.log(err);
          console.log(r);
          return res.json({
            success: true
          });
        });
      });
    }
  });
});

MongoClient.connect(mongoUrl, function(err, db) {
  if (err) {
    return printError(err);
  }
  console.log('Mongo client connected');
  GLOBAL.db = db;
  server.listen(GLOBAL.serverPort, function() {
    console.log(util.format('Server is running. %s:%d', 
        GLOBAL.serverAddress, GLOBAL.serverPort));
  });
});

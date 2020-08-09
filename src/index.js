import {express} from 'express';
import {cookieParser} from 'cookie-parser';
import {cookieSession} from 'cookie-session';
import {fs} from 'fs' ;
import {passport} from 'passport' ;
import {env} from process.env.NODE_ENV || 'development';
import {config} from './config/config';
import {auth} from './config/middlewares/authorization' ;
import {mongoose} from('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const cookieParserKey = process.env.COOKIE_KEY || "super55";
const sessionKey1 = process.env.SESSIONKEYONE || "key1";
const sessionKey2 = process.env.SESSIONKEYTWO || "key2";
const promiseRetry = require('promise-retry');
app.use(cookieParser(cookieParserKey));
app.use(cookieSession({
  name: 'session',
  keys: [sessionKey1, sessionKey2]
}));

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  reconnectTries: 60,
  reconnectInterval: 1000,
  poolSize: 10,
  bufferMaxEntries: 0 
};

const promiseRetryOptions = {
  retries: options.reconnectTries,
  factor: 2,
  minTimeout: options.reconnectInterval,
  maxTimeout: 5000
};

const connect = () => {
  return promiseRetry((retry, number) => {
    console.log(`MongoClient connecting to ${config.db} - retry number: ${number}`);
    return mongoose.connect(config.db, options).catch(retry)
  }, promiseRetryOptions);
};

const models_path = __dirname+'/app/models';
fs.readdirSync(models_path).forEach(file => {
  require(models_path+'/'+file);
});

require('./config/passport')(passport, config);
require('./config/express')(app, config, passport);
require('./config/routes')(app, passport, auth);

app.listen(port);
console.log('Express app started on port ' + port);

connect();
module.exports = app;
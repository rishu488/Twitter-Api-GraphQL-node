

import mongoose from 'mongoose';

import constants from './constants';

mongoose.Promise = global.Promise;

mongoose.set('debug', true); 
try {
  mongoose.connect(constants.DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
mongoose.connection.on("connected", () => {
    console.log("Connected " + constants.DB_URL);
})
} catch (err) {

 throw(err)
}

mongoose.connection
  .once('open', () => console.log('MongoDB Running'))
  .on('error', e => {
    throw e;
  });

const express = require('express');
const app = express();
app.disable("x-powered-by");
var cors = require('cors');


// serve up production assets
app.use(express.static('client/build'));
// let the react app to handle any unknown routes
// serve up the index.html if express does'nt recognize the route
const path = require('path');

const dotenv = require('dotenv');
dotenv.config({path: path.resolve(__dirname, '..', '.env')});

let corsOptions = {
    origin: process.env.REACT_APP_API_URL,
}

app.use(cors(corsOptions));
app.use('/', express.static(path.resolve(__dirname, '..', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", 'build', 'index.html'));
});
// if not in production use the port 5000
const PORT = process.env.PORT || 5000;
console.log('server started on port:', PORT);
app.listen(PORT);

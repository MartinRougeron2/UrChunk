// get port
const port = process.env.PORT || 8000;

// cors middleware to allow cross origin requests
const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, DELETE",
    "Access-Control-Allow-Credentials": 'http://localhost:3000',
    "Access-Control-Max-Age": '600',
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    credentials: true

};

module.exports = {corsOptions, port};
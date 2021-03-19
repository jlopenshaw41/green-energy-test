const express = require("express");
const app = express();
const subscriberControllers = require("./controllers/subscribers");
//From Twilio marketing notifications tutorial
const bodyParser = require('body-parser');
// const session = require('express-session');
const morgan = require('morgan');
const message = require("./controllers/message");

// Need to confirm whether incoming HTTP requests from Twilio are in JSON format
app.use(express.json());

// From Twilio marketing notifications tutorial - "Use morgan for HTTP request logging"
app.use(morgan('combined'));

// From Twilio marketing notifications tutorial - "Serve static assets"
// app.use(express.static(path.join(__dirname, 'public')));

// From Twilio marketing notifications tutorial - "Parse incoming form-encoded HTTP bodies"
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.post("/add-subscriber", subscriberControllers.create);

// Handle incoming SMS from users to our Twilio number (will look at this again later)
// app.post("/incoming-message", message.webhook);

// Hit this endpoint to send messages to subscribers
app.post('/subscribers/send-message', message.sendMessages);

app.get("/subscribers", subscriberControllers.list);

app.patch("/subscribers/:id", subscriberControllers.update);

app.delete("/subscribers/:id", subscriberControllers.deleteSubscriber);

module.exports = app;

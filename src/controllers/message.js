const { Subscriber } = require("../models");
const messageSender = require("../lib/messageSender");

// Don't know where these came from, were they auto-populated?
// import { default as app } from "../webapp";
// import { response } from "express";

// This section deals with incoming text messages, I've parked this for now

// export function webhook(req, res) {
//   // Get the user's phone number
//   const phone = req.body.From;

//   // Try to find a subscriber with the given phone number
//   Subscriber.findOne(
//     {
//       phone: phone,
//     },
//     (err, sub) => {
//       if (err) return respond("Error! Please text back again later");
//       if (!sub) {
//         const newSubscriber = new Subscriber({
//           phone: phone,
//         });
//         newSubscriber.save((err, newSub) => {
//           if (err || !newSub)
//             return respond("We couldn't sign you up, please try again");
//           respond(
//             'Thanks for contacting us! Text "subscribe" to ' +
//               "receive updates via text message"
//           );
//         });
//       } else {
//         processMessage(sub);
//       }
//     }
//   );
//   const processMessage = (subscriber) => {
//     let msg = req.body.Body || "";
//     msg = msg.toLowerCase().trim();
//     if (msg === "subscribe" || msg === "unsubscribe") {
//       subscriber.subscribed = msg === "subscribe";
//       subscriber.save((err) => {
//         if (err)
//           return respond("We could not subscribe you - please try " + "again.");
//         let responseMessage = "You are now subscribed for updates!";
//         if (!subscriber.subscribed)
//           responseMessage =
//             'You have unsubscribed. Text "subscribe"' +
//             " to start receiving updates again";
//         respond(responseMessage);
//       });
//     } else {
//       const responseMessage =
//         "Sorry, we didn't understand that. " +
//         "Available commands are: Subscribe or Unsubscribe";
//       respond(responseMessage);
//     }
//   };
//   const respond = (message) => {
//     res.type("text/xml");
//     res.render("twiml", {
//       message: message,
//     });
//   };
// }


// From TWILIO SMS marketing notifications tutorial - "Handle form submission"
exports.sendMessages = (req, res) => {
    // So we could have a form that allows us to compose messages using a GUI rather than backend, as discussed. When the form is submitted it needs to send a POST request to '/subscribers/send-message' (as defined in app.js) with 'message' in the req body
    const message = req.body.message;
    // Don't think we need this as it deals with media.MMS
    //   const imageUrl = req.body.imageUrl;

    // Is 'find' the right control or is that mongoose? Might need to be findAll for sequelize
  Subscriber.findAll({
    where: {
      subscribed: true,
    }
  })
    .then((subscribers) => {
      messageSender.sendMessageToSubscribers(subscribers, message);
    })
    // Don't think we need this:
    // .then(() => {
    //   req.flash("successes", "messages on their way");
    //   res.redirect("/");
    // })
    .catch((err) => {
      console.log(`Err ${err.message}`);
    //   req.flash("errors", err.message);
      // res.redirect("/");
    });
};

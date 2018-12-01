
const users = require('../controllers/users.js')
module.exports = function Route(app, server) {

    var firebase = require("firebase");
    var config = {
        apiKey: "AIzaSyDV-kRNZUkYqmBhnN-Z_PSi1ETh39pqVXI",
        authDomain: "react-4af11.firebaseapp.com",
        databaseURL: "https://react-4af11.firebaseio.com",
        storageBucket: "react-4af11.appspot.com",
    };
    firebase.initializeApp(config);
    var fbStorage = require("firebase/storage");

    var admin = require("firebase-admin");

    var serviceAccount = require("../../react-4af11-firebase-adminsdk-4idsu-c03b4e504a.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://react-4af11.firebaseio.com"
    });

    var session = require('express-session');
    var sessionUser;


    //Displays all users.
    app.get('/', users.index);
    //Login Registration Forms
    app.get('/login', users.login_registration);
    //Register User
    app.post('/register', users.register);
    //Login User
    app.post('/login', users.login);
    //Logout User
    app.get('/logout', users.logout);
    // Displays a form for making a new user.
    app.get('/user/new', users.new);
    // Displays information about one user.
    app.get('/user/:id', users.user_id);
    // Should be the action attribute for the form in the above route (GET '/user/new').
    app.post('/user', users.user);
    // Should update user information
    app.post('/user/update/:id', users.update);
    // Should delete the mongoose from the database by ID.
    app.get('/user/destroy/:id', users.delete);
    // Should get the balance activities
    app.get('/balance', users.balance);
    //Should calculate the total balance
    app.get('/total', users.total);
    //Should calculate today's total balance
    app.get('/total/today', users.total_today);
    //Displays all winners
    app.get('/winnings', users.winnings);
    //Displays Player's Baseball Card image_url
    app.get('/baseball_cards', users.baseball_cards);
    //Pay user 
    app.get('/pay/:id/:baseballCardUID', users.pay);
    //Paid activity log
    app.get('/paid', users.paid);
    //Challenge a friend
    app.get('/challenge/:id/:recordUID', users.challenge);
}

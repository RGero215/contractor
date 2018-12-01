
let isLogin = false;
let currentUserUID;
var sessionUser;
var firebase = require("firebase");
var admin = require("firebase-admin");
var session = require('express-session');
var sessionUser;
var alert = require('alert-node');
var prompt = require('prompt');
var share = require('social-share');





module.exports = {

    index: (request, response) => {

        if(isLogin){
            let users = [];
            let records = [];
            let allRecords;
            let usersRef = firebase.database().ref().child('users')
            let allUsers;
            let usersUID = [];
            sessionUser = request.session
            usersRef.once('value').then(function(snapshot) {
                for (let uid in snapshot.val()) {
                    usersUID.push(uid);
                    allUsers = snapshot.child(uid+'/user')
                    users.push(allUsers.val());
                }

              })
              .then(function () {

                  firebase.database().ref('/users/' + currentUserUID).once('value').then(function (snapshot) {
                      let currentUser = snapshot.val().user
                      for (var record in snapshot.val().records) {
                          allRecords = snapshot.val().records[record]
                          records.push(allRecords)
                      }
                      let overall = snapshot.val().stats
                      sessionUser.user = currentUser
                      sessionUser.uid = currentUserUID
                      let type = sessionUser.user.type
                      let name = sessionUser.user.type
                      console.log('User: ' + sessionUser.user.name);
                      console.log('Type: ' + sessionUser.user.type);
                      if(type === 'admin'){
                          response.render('index', {allUsers:users, usersUID: usersUID, currentUser:sessionUser.user})
                      } else if (type === 'terminal') {
                          response.render('dashboard', {allUsers:users, usersUID: usersUID, currentUser:sessionUser.user, type:'terminal'})
                      } else {
                          response.render('records', {records:records, usersUID: usersUID, currentUser:sessionUser.user, type:'player', currentUserUID: currentUserUID, overall:overall})
                      }
                  })

            })
        } else {
            response.redirect('/login')
        }

    },

    login_registration: (request, response) => {
        response.render('login')
    },

    register: (request, response) => {

        let email = request.body.email
        let password = request.body.password

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function (user) {
                isLogin = true
                var uid = user.uid
                firebase.database().ref('users').child(uid).set({
                    stats: {
                        atBats: 0,
                         atBats: 0,
                         avg: 0,
                         doubles: 0,
                         hits: 0,
                         homeRuns: 0,
                         lob: 0,
                         points: 0,
                         rbi: 0,
                         runs: 0,
                         singles: 0,
                         slg: 0,
                         triples: 0,
                    },
                    user: {
                        name: request.body.name,
                        email: email,
                        balance: 0,
                        type: "player"
                    }
                })
                response.redirect('/')
            })
            .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // ...
            });
    },

    login: (request, response) => {

        var email = request.body.email
        var password = request.body.password
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function() {
                // all users
                isLogin = true
                currentUserUID = firebase.auth().currentUser.uid
                return response.redirect('/');
            })
            .catch(function(error) {
                // Handle Errors here.
                console.log('Error: '+ error.message);
                response.redirect('/login')
        });
    },

    new: (request, response) => {
        console.log(request)
        response.render('new', {currentUser:sessionUser.user})
    },

    user_id: (request, response) => {
        let user;
        let uid = request.params.id
        var userRef = firebase.database().ref().child('users/'+ request.params.id)
        userRef.once('value').then(function(snapshot) {
            user = snapshot.val();
        })
        .then(function () {
            var currentUserUID = firebase.auth().currentUser.uid
            return firebase.database().ref('/users/' + currentUserUID).once('value').then(function (snapshot) {
                var type = snapshot.val().user.type
                if(type === 'admin'){
                    response.render("profile", {user: user, uid: uid, type: 'admin', currentUser:sessionUser.user})
                } else {
                    response.render("profile", {user: user, uid: uid, type: 'player', currentUser:sessionUser.user})
                }
            })
        })
    },

    user: (request, response) => {

        let pos = firebase.auth().currentUser.uid
        let email = request.body.email
        let password = request.body.password
        let uid;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function (user) {
                uid = user.uid
                firebase.database().ref('users').child(uid).set({
                    stats: {
                        atBats: 0,
                         atBats: 0,
                         avg: 0,
                         doubles: 0,
                         hits: 0,
                         homeRuns: 0,
                         lob: 0,
                         points: 0,
                         rbi: 0,
                         runs: 0,
                         singles: 0,
                         slg: 0,
                         triples: 0,
                    },
                    user: {
                        name: request.body.name,
                        email: email,
                        balance: Number(request.body.balance),
                        type: request.body.type
                    }
                })
            })
            .then(function () {
                // create balance activity
                if(Number(request.body.balance) > 0){
                    console.log(sessionUser.user.name);
                    firebase.database().ref('activities').push().set({
                        pos_uid: pos,
                        pos_name: sessionUser.user.name,
                        balance: Number(request.body.balance),
                        player_uid: uid,
                        player_name: request.body.name,
                        createdAt: firebase.database.ServerValue.TIMESTAMP
                    })
                }
                console.log('User => ' + sessionUser.user.name);
                console.log('Type => ' + sessionUser.user.type);
                response.redirect('/')
            })
            .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              console.log(errorMessage);
              // ...
            });
    },

    update: (request, response) => {
        let pos = firebase.auth().currentUser.uid
        let post_name;
        let playerCurrentBalance;
        // fetch for player current balance
        var uid = request.params.id
        var userRef = firebase.database().ref().child('users/'+ request.params.id)
        return userRef.once('value').then(function(snapshot) {
            playerCurrentBalance = snapshot.val().user.balance;
            console.log('Player Current Balance: ' + playerCurrentBalance);
        })
        .then(function () {
            let data;
            // update user info and balance
            if(playerCurrentBalance === 0){
                data = {
                    
                    name: request.body.name,
                    email: request.body.email,
                    balance: Number(request.body.balance),
                    type: request.body.type
                    
                }
            } else if (playerCurrentBalance > 0) {
                data = {
                    
                    name: request.body.name,
                    email: request.body.email,
                    balance: Number(request.body.balance) + playerCurrentBalance,
                    type: request.body.type
                    
                }
            }

            var updates = {};
            updates['users/'+ request.params.id + '/user'] = data;

            firebase.database().ref().update(updates)


        })
        .then(function () {
            // create balance activity
            console.log('Player New Balance: ' + Number(request.body.balance));
            console.log(playerCurrentBalance === Number(request.body.balance));
            if (playerCurrentBalance > 0) {
                firebase.database().ref('activities').push().set({
                    pos_uid: pos,
                    pos_name: sessionUser.user.name,
                    balance: Number(request.body.balance),
                    player_uid: request.params.id,
                    player_name: request.body.name,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                })
            }
            response.redirect('/')
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(error.message);
          // ...
        });
    },

    delete: (request, response) => {
        admin.auth().deleteUser(request.params.id)
          .then(function() {
             var userRef = firebase.database().ref().child('users/'+ request.params.id)
             userRef.remove()
             console.log("Successfully deleted user");
             response.redirect('/')
          })
          .catch(function(error) {
            console.log("Error deleting user:", error);
          });
    },

    logout: (request, response) => {
        firebase.auth().signOut()
            .then(function() {
                isLogin = false
                request.session.destroy()
                response.redirect('/')
            })
            .catch(function (error) {
                console.log(error.message);
            })
    },

    balance: (request, response) => {
        if (isLogin) {
            let timestamps = [];
            let activities = [];
            var activitiesRef = firebase.database().ref().child('activities/')
            activitiesRef.once('value').then(function(snapshot) {

                for (var index in snapshot.val()) {
                    //console.log('Date: ' + stringTimeStamp);
                    allActivities = snapshot.child(index)
                    // console.log(allActivities.val());
                    // console.log(allActivities.val().createdAt);

                    var temp = allActivities.val().createdAt.toString().substring(0,10)
                    var date = new Date(temp * 1000)
                    // console.log('Date: ' + date.toDateString());
                    var dateString = date.getDate() + '/' + date.getMonth() + 1 + '/' + date.getFullYear()
                    timestamps.push(dateString)
                    activities.push(allActivities.val());
                }
                response.render('balance', {activities: activities, currentUser: sessionUser.user, date: timestamps})
            })
            .catch(function(error) {
                console.log(error.message);
            })

        } else {
            response.redirect('/login')
        }
    },

    total: (request, response) => {
        if (isLogin) {

            var sum = 0;
            var total;
            var activitiesRef = firebase.database().ref().child('activities/')
            activitiesRef.once('value').then(function(snapshot) {

                for (var index in snapshot.val()) {
                    //console.log('Date: ' + stringTimeStamp);

                    allActivities = snapshot.child(index)

                    // console.log(allActivities.val().balance);

                    sum += allActivities.val().balance

                }
                console.log('Total: $' + sum + ".00");
                total = 'La suma del balance total es de: $' + sum + ".00"
                alert(total)
                // response.render('balance', {activities: activities, currentUser: sessionUser.user, date: timestamps})
            })
            .catch(function(error) {
                console.log(error.message);
            })

        } else {
            response.redirect('/login')
        }
    },

    total_today: (request, response) => {
        if (isLogin) {
            var todayIs;
            var sum = 0;
            var total;
            var activitiesRef = firebase.database().ref().child('activities/')
            activitiesRef.once('value').then(function(snapshot) {

                for (var index in snapshot.val()) {
                    //console.log('Date: ' + stringTimeStamp);
                    allActivities = snapshot.child(index)
                    var temp = allActivities.val().createdAt.toString().substring(0,10)
                    var date = new Date(temp * 1000)
                    todayIs = new Date()

                    if(date.toDateString() === todayIs.toDateString()) {
                        sum += allActivities.val().balance
                    }


                    // console.log(allActivities.val().balance);



                }
                console.log('Total: $' + sum + ".00");
                total = 'Balance Total: $' + sum + ".00" + ' para el día de hoy: ' + todayIs.toDateString()

                alert(total)
                // response.render('balance', {activities: activities, currentUser: sessionUser.user, date: timestamps})
            })
            .catch(function(error) {
                console.log(error.message);
            })

        } else {
            response.redirect('/login')
        }
    },

    winnings: (request, response) => {
        if (isLogin) {

            let timestamps = [];
            let winnings = [];
            var winningsRef = firebase.database().ref().child('winnings/')
            winningsRef.once('value').then(function(snapshot) {

                for (var index in snapshot.val()) {
                    // console.log(snapshot.val());
                    var allWinnings = snapshot.child(index)
                    // console.log(allWinnings.val());
                    // console.log(allActivities.val().createdAt);

                    var temp = allWinnings.val().created_at.toString().substring(0,10)
                    var date = new Date(temp * 1000)
                    // console.log('Date: ' + date.toDateString());
                    var dateString = date.getDate() + '/' + date.getMonth() + 1 + '/' + date.getFullYear()
                    timestamps.push(dateString)
                    winnings.push(allWinnings.val());
                }
                response.render('winnings', {winnings: winnings, currentUser: sessionUser.user, date: timestamps})
            })
            .catch(function(error) {
                console.log(error.message);
            })

        } else {
            response.redirect('/login')
        }
    },

    baseball_cards: (request, response) => {

        if (isLogin) {
            let baseball_cards = [];
            firebase.database().ref('/users/' + currentUserUID).once('value').then(function (snapshot) {

                for (var index in snapshot.val().baseball_cards) {
                    allBaseball_cards = snapshot.val().baseball_cards[index]
                    baseball_cards.push(allBaseball_cards)
                }

                response.render('baseball_cards', {baseball_cards:baseball_cards, currentUser:sessionUser.user, currentUserUID: currentUserUID})
            })
            .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error.message);
                // ...
            });
            

        } else {
            response.redirect('/login')
        }

    },

    pay: (request, response) => {
        let pos = firebase.auth().currentUser.uid
        let post_name;
        let baseballCard;
        if (isLogin) {
            let baseball_cards = [];
            return firebase.database().ref('/users/' + request.params.id +'/baseball_cards/' + request.params.baseballCardUID).once('value').then(function (snapshot) {
                console.log(snapshot.val())
                baseballCard = snapshot.val()
                console.log("--+++++++--->"+ request.params.baseballCardUID )
            })
            .then(function () {
                let data;
                // update payment status
               console.log("--------->"+ baseballCard.UID)
               // this is because I added a recordUID reference and I still have baseballCards without that reference.
               if(baseballCard.recordUID){
                    data = {
                        UID: baseballCard.UID,
                        amount: baseballCard.amount,
                        created_at: baseballCard.created_at,
                        image_height: baseballCard.image_height,
                        image_url: baseballCard.image_url,
                        status: 'PAID',
                        recordUID: baseballCard.recordUID // added the record reference
                    }
               } else if(!baseballCard.recordUID){
                    data = {
                        UID: baseballCard.UID,
                        amount: baseballCard.amount,
                        created_at: baseballCard.created_at,
                        image_height: baseballCard.image_height,
                        image_url: baseballCard.image_url,
                        status: 'PAID',
                    }
               }
                

                var updates = {};
                updates['/users/' + request.params.id +'/baseball_cards/' + request.params.baseballCardUID] = data;

                firebase.database().ref().update(updates)

            })
            .then(function () {
                var allWinnings;
                var winningsRef = firebase.database().ref().child('winnings/')
                winningsRef.once('value').then(function(snapshot) {

                    for (let index in snapshot.val()) {
                        //console.log('Date: ' + stringTimeStamp);
                        allWinnings = snapshot.child(index)
                        
                        
                        if(allWinnings.val().baseballCardUID === request.params.baseballCardUID) {
                            let data;
                            // update payment status
                            console.log("---------> HERE")
                            data = {
                                UID: baseballCard.UID,
                                amount: "$0",
                                baseballCardUID: request.params.baseballCardUID,
                                created_at: baseballCard.created_at,
                                image_height: baseballCard.image_height,
                                image_url: baseballCard.image_url,
                                status: 'PAID'
                            }

                            var updates = {};
                            updates['/winnings/' + index] = data;

                            firebase.database().ref().update(updates)
                        }
                        
                    }
                    
                    
                })

            })
            .then(function () {
                // create pay activity
            
                firebase.database().ref('paid').push().set({
                    pos_uid: pos,
                    pos_name: sessionUser.user.name,
                    amount: baseballCard.amount,
                    status: "PAID",
                    player_uid: request.params.id,
                    baseballCardUID: request.params.baseballCardUID,
                    image_url: baseballCard.image_url,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                })

                response.redirect('/')
                
        
            })
            .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              console.log(error.message);
              // ...
            });
                    

        } else {
            response.redirect('/login')
        }

    },

    paid: (request, response) => {
        if (isLogin) {
            let timestamps = [];
            let activities = [];
            var activitiesRef = firebase.database().ref().child('paid/')
            activitiesRef.once('value').then(function(snapshot) {

                for (var index in snapshot.val()) {
                    //console.log('Date: ' + stringTimeStamp);
                    allActivities = snapshot.child(index)
                    // console.log(allActivities.val());
                    // console.log(allActivities.val().createdAt);

                    var temp = allActivities.val().createdAt.toString().substring(0,10)
                    var date = new Date(temp * 1000)
                    // console.log('Date: ' + date.toDateString());
                    var dateString = date.getDate() + '/' + date.getMonth() + 1 + '/' + date.getFullYear()
                    timestamps.push(dateString)
                    activities.push(allActivities.val());
                }
                response.render('paid', {activities: activities, currentUser: sessionUser.user, currentUserUID: sessionUser.uid , date: timestamps})
            })
            .catch(function(error) {
                console.log(error.message);
            })

        } else {
            response.redirect('/login')
        }
    },

    challenge: (request, response) => {
        if (isLogin) {
            
            var userRef = firebase.database().ref().child('users/'+ request.params.id).child('records/' +request.params.recordUID)
            userRef.once('value').then(function(snapshot) {
                var record = snapshot.val()
                
                response.render('challenge', {record: record, currentUser:sessionUser.user})
                
            })
            .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(error.message);
                // ...
              });
        } else {
            response.redirect('/login')
        }
    }

}

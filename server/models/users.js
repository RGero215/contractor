// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcrypt-as-promised');
//
//
// const UserSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, "Please enter your first name"],
//         trim: true
//     },
//     email: {
//         type: String,
//         required: [true, 'Please enter a valid email address'],
//         unique: true,
//         validate: [validator.isEmail, "Invalid email address"]
//     },
//     password: {
//         type: String,
//         required: [true, "Please enter a password"],
//         minlength: 6,
//         maxlength: 255,
//     },
// }, {
//     timestamps: true
// })
//
// UserSchema.pre('save', function (done) {
//     bcrypt.hash(this.password, 10)
//         .then(hashedpw => {
//             this.password = hashedpw;
//             done();
//         })
//         .catch(error => {
//             console.log(error);
//             done();
//         })
// })
//
// const User = mongoose.model('User', UserSchema);

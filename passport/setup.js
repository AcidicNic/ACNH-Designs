const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models/User");


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


passport.use(
    new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
        // Match User
        User.findOne({ username: username }, 'username password')
            .then(user => {
                if (!user) {
                    const newUser = new User({ username, password });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {
                                    return done(null, user);
                                })
                                .catch(err => {
                                    return done(null, false, { err: err });
                                });
                        });
                    });
                } else {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (!user.password) { return done(null, false, { err: err }); }
                        if (err) {throw err}
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { err: "Wrong password" });
                        }
                    });
                }
            })
            .catch(err => {
                return done(null, false, { message: err });
            });
    })
);

module.exports = passport;
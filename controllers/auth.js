const passport = require("passport");
const User = require("../models/User");
const Design = require('../models/Design');

exports.getProfile = (req, res) => {
    const username = req.params.username;

    User.findOne({username}).lean()
    .then(user => {
        if (!user) {
            res.redirect(res.redirect(`/?err=User '${username}' not found!`));
        }
        Design.find({creator: user._id}).lean()
        .then(designs => {
            console.log(designs);
            res.render("profile", { title: `${user.username}'s Profile`, user, designs });
        }).catch(err => {
            res.redirect(res.redirect(`/?err=${err}`));
        });
    }).catch(err => {
        res.redirect(res.redirect(`/?err=${err}`));
    });
};

exports.getProfileForm = (req, res) => {
    User.findOne({username: req.user.username}).lean()
    .then(user => {
        res.render("editProfile", { title: "Edit Profile", form: user });
    }).catch(err => {
        res.redirect(res.redirect(`/?err=${err}`));
    });
};

exports.postProfile = (req, res) => {
    // if (!req.user) { return res.redirect('/login'); }
    const creatorIdRegex = /^(MA-)?([0-9]{4}).?([0-9]{4}).?([0-9]{4})$/;
    console.log(creatorIdRegex.test(req.body.creatorId));
    if (!creatorIdRegex.test(req.body.creatorId) && req.body.creatorId !== "") {
        return res.render('editProfile', {
            err: "Creator ID can only contain numbers!", form: req.body, title: "Edit Profile"
        });
    }

    User.findByIdAndUpdate({ _id: req.user._id }, req.body)
    .then(user => {
        return res.redirect(`/u/${user.username}`);
    });
};

exports.getSignup = (req, res) => {
    if (req.user) { return res.redirect('/'); }
    res.render("signup", {title: "Sign Up", signup: true});
};

exports.postSignup = (req, res, next) => {
    const username = req.body.username;

    if (req.body.password.length < 6) {
        return res.render('signup', {
            err: "Password must be 6 characters or longer!", form: {username}, title: "Sign Up", signup:true
        });
    }
    else if (username.length > 16) {
        return res.render('signup', {
            err: "Username can be up to 16 characters!", form: {username}, title: "Sign Up", signup:true
        });
    }
    else {
        passport.authenticate("local", function (err, user, info) {
            if (err) {
                return res.render('signup', {err: info.err, form: {username}, title: "Sign Up", signup: true});
            }
            if (!user) {
                return res.render('signup', {
                    err: `User '${username}' already exists!`, form: {username}, title: "Sign Up", signup:true
                });
            }
            req.logIn(user, function (err) {
                if (err) {
                    return res.render('signup', {err: info.err, form: {username}, title: "Sign Up", signup: true});
                }
                return res.redirect('/edit/u');
            });
        })(req, res, next);
    }
};

exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render("login", {title: "Login", login:true});
};

exports.postLogin = (req, res, next) => {
    if (req.user) {
        return res.redirect('/');
    }
    const username = req.body.username;

    User.findOne({ username }, "username")
    .then(user => {
        if (!user) {
            console.log("!user");
            return res.render('login', {
                err: `User '${username}' does not exist!`, form: {username}, title: "Login", login:true
            });
        } else {
            passport.authenticate("local", function(err, user, info) {
                if (err) {
                    console.log({ info, form: {username}, title: "Login", login:true });
                    return res.render('login', { err: info.err, form: {username}, title: "Login", login:true });
                }
                if (!user) {
                    console.log({ info, form: {username}, title: "Login", login:true });
                    return res.render('login', { err: info.err, form: {username}, title: "Login", login:true });
                }
                req.logIn(user, function(err) {
                    console.log({ info, form: {username}, title: "Login", login:true });
                    if (err) {
                     return res.render('login', { err: info.err, form: {username}, title: "Login", login:true });
                    }
                     return res.redirect('/');
                });
            })(req, res, next);
        }
    }).catch(err => {
        console.log(err);
    });

};

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.deleteUser = (req, res) => {
    if (!req.user) {
        return res.redirect('/?err=You need to be logged in to do that!');
    }
    const username = req.user.username;
    User.findOneAndRemove({_id: req.user._id}, (err) => {
        if (err) {
            return res.redirect('/?err=Oops, something went wrong!');
        }
        Design.deleteMany({ creator: req.user._id }, (err) => {
            if (err) {
                return res.redirect('/?err=Oops, something went wrong!');
            }
            return res.redirect(`/?msg=Your account, ${username}, has successfully been deleted! :( Bye friend.`);
        });
    });
};

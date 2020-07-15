const jwt = require('jsonwebtoken');
const User = require("../models/user");

exports.getProfile = (req, res) => {
    const username = req.params.username;
    User.findOne({username}).lean()
    .then(user => {
        if (!user) {
            res.redirect(res.redirect(`/?err=User '${username}' not found!`));
        }
        res.render("profile", { title: `${user.username}'s Profile`, cUser: req.user, user });
    }).catch(err => {
        res.redirect(res.redirect(`/?err=${err}`));
    });
};

exports.getProfileForm = (req, res) => {
    // if (!req.user) { return res.redirect('/login'); }
    res.render("editProfile", { title: "Edit Profile", cUser: req.user });
};

exports.postProfile = (req, res) => {
    if (!req.user) { return res.redirect('/login'); }

    const creatorIdRegex = /^(MA-)?([0-9]{4})-?([0-9]{4})-?([0-9]{4})$/;
    if (creatorIdRegex.test(req.body.creatorId)) {
        return res.render('editProfile', {
            err: "Creator ID can only contain numbers!", form: req.body, title: "Edit Profile", cUser: req.user
        });
    }

    User.findByIdAndUpdate({ _id: req.user._id }, req.body)
    .then(user => {
        return res.redirect(res.redirect(`/u/${user.username}`));
    });
};

exports.getSignup = (req, res) => {
    if (req.user) { return res.redirect('/'); }
    res.render("signup", {title: "Sign Up", signup: true});
};

exports.postSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    const username = req.body.username;
    console.log(User.find({username:username}).count());
    if (User.find({username:username}).count()._executionCount !== 0) {
        return res.render('signup', {
            err: `User '${username}' already exists!`, form: {username}, title: "Sign Up", signup:true
        });
    }
    if (req.body.password.length < 8) {
        return res.render('signup', {
            err: "Password must be 8 characters or longer!", form: {username}, title: "Sign Up", signup:true
        });
    }
    if (username.length > 16) {
        return res.render('signup', {
            err: "Username can be up to 16 characters!", form: {username}, title: "Sign Up", signup:true
        });
    }

    const user = new User(req.body);
    user.save().then((user) => {
        var token = jwt.sign({ _id: user._id }, process.env.SESSION_SECRET, { expiresIn: "60 days" });
        res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
        res.redirect(`/u/${user.username}`);
    })
    .catch(err => {
        console.log(err.message);
    });
};

exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render("login", {title: "Login", login:true});
};

exports.postLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    const username = req.body.username;

    User.findOne({ username }, "username password")
    .then(user => {
        if (!user) {
            return res.render('login', {
                err: `User '${username}' does not exist!`, form: {username}, title: "Login", login:true
            });
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.render('login', {
                    err: "Wrong username or password!", form: {username}, title: "Login", login:true
                });
            }
            const token = jwt.sign(
                { _id: user._id, username: user.username },
                process.env.SESSION_SECRET,
                { expiresIn: "60 days" }
            );
            res.cookie("nToken", token, { maxAge: 900000, httpOnly: true });
            res.redirect("/");
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.logout = (req, res) => {
    res.clearCookie('nToken');
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
        return res.redirect(`/?err=Your account, ${username}, has successfully been deleted! :( Bye friend.`);
    });
};

exports.checkAuth = (req, res, next) => {
  if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
    req.user = null;
  } else {
    const token = req.cookies.nToken;
    const decodedToken = jwt.decode(token, { complete: true }) || {};
    User.findOne({_id: decodedToken.payload._id}).lean()
    .then(user => {
        req.user = user
    });
  }
  next();
};

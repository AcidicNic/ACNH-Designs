const Design = require('../models/Design');

exports.index = (req, res) => {
    const msg = req.query.msg;
    Design.find({}).lean()
    .then(designs => {
        res.render('home', {designs, cUser: req.user, msg});
    }).catch(err => {
        console.log(err);
    });
};

exports.getDesign = (req, res) => {
    Design.findOne({}).populate('creator.user').lean()
    .then(design => {
        res.render("design", {title: design.title, cUser: req.user});
    }).catch(err => {
        console.log(err);
    });
};

exports.getDesignForm = (req, res) => {
    if (!req.user) { return res.redirect('/'); }
    res.render("addDesign", { title: "Create Design", cUser: req.user });
};

exports.postDesign = (req, res) => {
    if (!req.user) { return res.redirect('/'); }
    const designIdRegex = /^(MO-)?(([A-HJ-NP-Y0-9]){4})-?([A-HJ-NP-Y0-9]{4})-?([A-HJ-NP-Y0-9]{4})$/;
    if (designIdRegex.test(req.body.designId)) {
        return res.render('addDesign', {
            err: "Design ID can only contain numbers!", form: req.body, title: "Create Design", cUser: req.user
        });
    }
    const design = new Design(req.body);
    design.save().then((design) => {
        res.redirect(`/d/${design._id}`);
    }).catch(err => {
        console.log(err.message);
    });
};

exports.deleteDesign = (req, res) => {
    if (!req.user) {
        return res.redirect('/?msg=You need to be logged in to do that!');
    }
    Design.findOneAndRemove({slug: req.params.id, creator: req.user._id}, (err) => {
        if (err) {
            return res.redirect('/?msg=Oops, something went wrong!');
        }
        return res.redirect('/?msg=Your design successfully deleted!');
    });
};

const Design = require('../models/Design');

exports.index = (req, res) => {
    const msg = req.query.msg;
    Design.find({}).populate('creator').lean()
    .then(designs => {
        console.log(designs);
        res.render('home', {designs, msg});
    }).catch(err => {
        console.log(err);
    });
};

exports.getDesign = (req, res) => {
    const slug = req.params.slug;
    Design.findOne({slug}).populate('creator').lean()
    .then(design => {
        if (!design) {
            return res.redirect("/?msg=Can't find that design");
        }
        else if (req.user) {
            if (req.user._id.equals(design.creator._id)) {
                return res.render("design", {title: design.title, design, ownDesign: true});
            }
        }
        else {
            return res.render("design", {title: design.title, design});
        }
    }).catch(err => {
        console.log(err);
    });
};

exports.getDesignForm = (req, res) => {
    res.render("addDesign", { title: "Create Design" });
};

exports.editDesignForm = (req, res) => {
    const slug = req.params.slug;
    Design.findOne({slug}).populate('creator').lean()
    .then(design => {
        if (req.user._id.equals(design.creator._id)) {
            return res.render("editDesign", {title: `Edit ${design.title}`, form: design, slug});
        } else {
            return res.redirect('/?msg=Oops, something went wrong!');
        }
    }).catch(err => {
        return res.redirect('/?msg='+err);
    });

};

exports.updateDesign = (req, res) => {
    const designIdRegex = /^(MO-)?(([A-HJ-NP-Y0-9]){4})-?([A-HJ-NP-Y0-9]{4})-?([A-HJ-NP-Y0-9]{4})$/;
    if (designIdRegex.test(req.body.designId)) {
        return res.render("editDesign", {err: "Invalid design ID!", title: `Edit ${req.body.title}`, form: req.body, slug: req.params.slug});
    }
    Design.update({slug: req.params.slug}, req.body)
    .then(design => {
        return res.redirect(`/?msg=Succesfully updated design listing!`);
    });
};

exports.postDesign = (req, res) => {
    const designIdRegex = /^(MO-)?(([A-HJ-NP-Y0-9]){4})-?([A-HJ-NP-Y0-9]{4})-?([A-HJ-NP-Y0-9]{4})$/;
    if (designIdRegex.test(req.body.designId)) {
        return res.render('addDesign', {
            err: "Invalid design ID!", form: req.body, title: "Create Design"
        });
    }
    const design = new Design(req.body);
    design.creator = req.user._id;
    design.save().then((design) => {
        res.redirect(`/d/${design.slug}`);
    }).catch(err => {
        console.log(err.message);
    });
};

exports.deleteDesign = (req, res) => {
    Design.findOneAndRemove({_id: req.params.id, creator: req.user._id}, (err) => {
        if (err) {
            return res.redirect('/?msg=Oops, something went wrong!');
        }
        return res.redirect('/?msg=Your design successfully deleted!');
    });
};

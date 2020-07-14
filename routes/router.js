const express = require('express');
const router = express.Router();

// Designs
const main = require('../controllers/main');
router.get('/', main.index);
router.get('/d/:slug', main.getDesign);
router.get('/create/d', main.getDesignForm);
router.post('/create/d', main.postDesign);
// router.get('/d/:slug/edit', main.editDesignForm);
// router.post('/d/:slug/edit', main.updateDesign);
router.post('/delete/d', main.deleteDesign);

// Auth
const auth = require('../controllers/auth');
router.get('/signup', auth.getSignup);
router.post('/signup', auth.postSignup);
router.get('/login', auth.getLogin);
router.post('/login', auth.postLogin);
router.get('/logout', auth.logout);
// Profile
router.get('/u/:username', auth.getProfile);
router.get('/edit/u', auth.getProfileForm);
router.post('/edit/u', auth.postProfile);
router.post('/delete/u', auth.deleteUser);

module.exports = router;
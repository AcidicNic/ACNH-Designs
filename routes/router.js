const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('connect-ensure-login');

// Designs
const main = require('../controllers/main');
router.get('/', main.index);
router.get('/d/:slug', main.getDesign);
router.get('/create/d', ensureLoggedIn('/login'), main.getDesignForm);
router.post('/create/d', ensureLoggedIn('/login'), main.postDesign);
router.get('/d/:slug/edit', ensureLoggedIn('/login'), main.editDesignForm);
router.post('/d/:slug/edit', ensureLoggedIn('/login'), main.updateDesign);
router.post('/delete/d/:id', ensureLoggedIn('/login'), main.deleteDesign);
router.get('/search', main.searchAll);

// Auth
const auth = require('../controllers/auth');
router.get('/signup', auth.getSignup);
router.post('/signup', auth.postSignup);
router.get('/login', auth.getLogin);
router.post('/login', auth.postLogin);
router.get('/logout', auth.logout);
// Profile
router.get('/u/:username', auth.getProfile);
router.get('/edit/u', ensureLoggedIn('/login'), auth.getProfileForm);
router.post('/edit/u', ensureLoggedIn('/login'), auth.postProfile);
router.post('/delete/u', ensureLoggedIn('/login'), auth.deleteUser);

module.exports = router;
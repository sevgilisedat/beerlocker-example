var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');
var BearerStrategy = require('passport-http-bearer').Strategy;
var Token = require('../models/token');
var Client = require('../models/client');

passport.use(new BasicStrategy(
	function(username, password, callback) {
		User.findOne({username: username}, function(err, user) {
			if(err) {
				return callback(err);
			}

			if(!user) {
				return callback(null, false);
			}

			user.verifyPassword(password, function(err, isMatch) {
				if(err) {
					return callback(err);
				}

				if(!isMatch) {
					return callback(null, false);
				}

				return callback(null, user);
			});
		});
	}
));

passport.use('client-basic', new BasicStrategy(
	function(username, password, callback) {
		Client.findOne({ id: username }, function (err, client) {
		  if (err) { return callback(err); }

		  // No client found with that id or bad password
		  if (!client || client.secret !== password) { return callback(null, false); }

		  // Success
		  return callback(null, client);
		});
	}
));

passport.use(new BearerStrategy(
	function(accessToken, callback) {
		Token.findOne({value: accessToken}, function(err, token) {
			if(err) {
				return callback(err);
			}

			if(!token) {
				return callback(null, false);
			}

			User.findOne({_id: token.userId}, function(err, user) {
				if(err) {
					return callback(err);
				}

				if(!user) {
					return callback(null, false);
				}

				callback(null, user, { scope: '*'});
			});
		});
	}
));

exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], {session: false});
exports.isClientAuthenticated = passport.authenticate('client-basic', {session: false});
exports.isBearerAuthenticated = passport.authenticate('bearer', {session: false});

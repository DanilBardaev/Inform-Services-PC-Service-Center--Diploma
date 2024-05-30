const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const passport = require("passport");
const { User } = require("../models/user");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("test.sqlite");
module.exports = function(passport) {
    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, async function(jwtPayload, done) {
        try {
            const user = await User.findOne({ where: { email: jwtPayload.email } });
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    }));
}
 
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        const selectUserQuery = "SELECT * FROM users WHERE id = ?";
        db.get(selectUserQuery, [id], (err, user) => {
            if (err) {
                return done(err);
            }
            done(null, user);
        });
    });
    

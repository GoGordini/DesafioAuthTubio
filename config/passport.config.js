import passport from 'passport';
import local from 'passport-local'; //uso estrategia local
import usersModel from '../dao/dbManager/models/users.model.js';
import { createHash, isValidPassword } from '../utils.js';
import GitHubStrategy from 'passport-github2';

//local es autenticacion con usuario y contraseña
const LocalStrategy = local.Strategy;

// const initializePassport = () => {
//     //Implementación de nuestro registro
// passport.use('register', new LocalStrategy({ //segundo parámetro es la estrategia
//         passReqToCallback: true, //permite acceder al objeto request como cualquier otro middleware
//         usernameField: 'email' //porque no tenemos un username sino un email
//     }, async (req, username, password, done) => {
//         try {
//             const { first_name, last_name, age } = req.body; //obvio email y password porque ya los tengo de dos líneas antes
//             const user = await usersModel.findOne({ email: username }); //el email no vino en el body como tal sino que tengo el username.
            
//             if(user) {
//                 return done(null, false); //null es sin errores es la búsqueda, false es que no pudo autenticar porque el email ya existe.
//             }

//             const userToSave = {
//                 first_name,
//                 last_name,
//                 email: username,
//                 age,
//                 password: createHash(password)
//             }

//             const result = await usersModel.create(userToSave);
//             return done(null, result); //req.user {first,last,age,email}. Passport genera el user dentro de request con esos atributos.
//         } catch (error) {
//             return done(`Incorrect credentials`)
//         }
//     }));
//     //Implementación de nuestro login
// //  passport.use('login', new LocalStrategy({
// //         usernameField: 'email'
// //     }, async (username, password, done) => {
// //         try {
// //             const user = await usersModel.findOne({ email: username });

// //             if(!user || !isValidPassword(password, user.password)) {
// //                 return done(null, false)
// //             }

// //  return done(null, user); //req.user

// //         } catch (error) {
// //             return done(`Incorrect credentials`)
// //         }
// //     }));
const initializePassport = () => {
    //Implementación de nuestro mecanismo de autenticación con github
    passport.use('github', new GitHubStrategy({ //los 3 primeros parámetros salen de la app de git.
        clientID: 'Iv1.e0b3de4024dcd9c8',
        clientSecret: 'e425d65adad822a637381bac2342a9290f734eb6',
        callbackURL: 'http://localhost:8080/api/sessions/github-callback',
        scope: ['user:email'] //esto trae del usuario el email, con los que me estoy logueando en github.
    }, async (accessToken, refreshToken, profile, done) => { //los dos primeros por ahora no los uso, son para JWT.
        try {
          // console.log(profile); //el profile me llega de github
            // {
                    // _json: {
                    //     name: 'alex'
                    // }
            //     emails: [{value: 'ap@hotmail.com'}]
            // }
            const email = profile.emails[0].value; //en profile llega un atributo que se llama emails: emails: [{value: 'ap@hotmail.com'}]
            const user = await usersModel.findOne({ email });

            if(!user) {
                //crear la cuenta o usuario desde cero. Obtengo lo que puedo de Github.  _json: { name: 'alex' }
                const newUser = {
                    first_name: profile._json.login,
                    last_name: ' ', //no viene de github
                    age: 5000, //no viene de github, pongo algo por defecto.
                    email,
                    password: ' ' //no la necesito con este mecanismo de aut, por eso seteo vacío.
                }

                const result = await usersModel.create(newUser);
                return done(null, result); //req.user {first,last,age,email}
            } else {
                return done(null, user);
            }
        } catch (error) {
            console.log(error)
            return done(`Incorrect credentials`)
        }
    }));

//Implementación de nuestro registro
passport.use('register', new LocalStrategy({ //segundo parámetro es la estrategia
        passReqToCallback: true, //permite acceder al objeto request como cualquier otro middleware
        usernameField: 'email' //porque no tenemos un username sino un email
    }, async (req, username, password, done) => {
        try {
            const { first_name, last_name, age } = req.body; //obvio email y password porque ya los tengo de dos líneas antes
            const user = await usersModel.findOne({ email: username }); //el email no vino en el body como tal sino que tengo el username.
            
            if(user) {
                return done(null, false); //null es sin errores es la búsqueda, false es que no pudo autenticar porque el email ya existe.
            }

            const userToSave = {
                first_name,
                last_name,
                email: username,
                age,
                password: createHash(password)
            }

            const result = await usersModel.create(userToSave);
            return done(null, result); //req.user {first,last,age,email}. Passport genera el user dentro de request con esos atributos.
        } catch (error) {
            return done(`Incorrect credentials`)
        }
    }));
//    Implementación de nuestro login
 passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            const user = await usersModel.findOne({ email: username });

            if(!user || !isValidPassword(password, user.password)) {
                return done(null, false)
            }

 return done(null, user); //req.user

        } catch (error) {
            return done(`Incorrect credentials`)
        }
    }));
    //Serializaccion y DeSerializaccion
 passport.serializeUser((user, done) => {
        done(null, user._id); //almacena el id del usuario para poder consultarlo si hace falta. No hay error (solo setea id), almacena el user._id.
    });

 passport.deserializeUser(async(id, done) => { //busca en la DB el user en cuestión por id.
        const user = await usersModel.findById(id);
        done(null, user); //no hay error. Una vez que lo tengamos, retorna el user con todos sus datos a partir del id que le corresponde.
    })
}

export {
    initializePassport
}
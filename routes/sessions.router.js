import { Router } from 'express';
import usersModel from '../dao/dbManager/models/users.model.js';
import { createHash, isValidPassword } from '../utils.js';
import passport from 'passport';
const router = Router();

//Marcar de 9 a 101 y descomentar.

router.post("/register",passport.authenticate("register",{failureRedirect: "fail-register"}), async (req, res) => {
    res.status(201).send({ status: 'success', message: 'user registered' })}) //passport.auth es un middleware. Pongo register, primer parámetro, porque en config puse passport.use("register"). Segundo parámetro es el camino como plan B (si falla va a la ruta fail-register).
// router.post('/register', async (req, res) => {
    // try {
    //     const { first_name:firstName, last_name:lastName, email, age, password } = req.body;

    //     if (!firstName|| !lastName || !email || !age || !password) {
    //         return res.status(422).send({ status: 'error', message: 'incomplete values' });
    //     }//problemas con el body es 422.

    //     const exists = await usersModel.findOne({ email });

    //     if (exists) {
    //         return res.status(400).send({ status: 'error', message: 'user already exists' });
    //     }
    //    //const role=(email=="adminCoder@coder.com");

    //     await usersModel.create({
    //         first_name: firstName,
    //         last_name: lastName,
    //         email,
    //         age,
    //       //  password
    //         password: createHash(password) //password no se guarda plana sino que se hashea
    //      //   isAdmin:role
    //     })

    //     res.status(201).send({ status: 'success', message: 'user registered' });
    // } catch (error) {
    //     res.status(500).send({ status: 'error', message: error.message })
    // }
// });

router.get('/fail-register', async (req, res) => {
    res.status(500).send({ status: 'error', message: 'register fail' });
});
// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//        // const user = await usersModel.findOne({ email, password });
//        const user = await usersModel.findOne({ email });
//         if (!user) {
//             return res.status(401).send({ status: 'error', message: 'incorrect credentials' });
//         }
//         const role=(user.email=="adminCoder@coder.com");

//         //valido la pass hasheada, con ifValidPassword de utils.js:

//         if (!isValidPassword(password,user.password)){
//             return res.status(401).send({ status: 'error', message: 'incorrect credentials' })
//         }

//         req.session.user = {
//             name: `${user.first_name} ${user.last_name}`,
//             email: user.email,
//             age: user.age,
//             isAdmin: role

//         } //seteo el atributo user en la session, sin datos sensibles.

//         res.send({ status: 'success', message: 'login success' })
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({ status: 'error', message: error.message })
//     }
// });

router.post('/login', passport.authenticate('login', { failureRedirect: 'fail-login' }), async (req, res) => {
    if(!req.user) { //user me lo trae passport
        return res.status(401).send({ status: 'error', message: 'invalid credentials' })
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        isAdmin:(req.user.email=="adminCoder@coder.com")
    }
    res.send({ status: 'success', message: 'login success' })
});

router.get('/fail-login', async (req, res) => {
    res.status(500).send({ status: 'error', message: 'login fail' });
});

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if(error) return res.status(500).send({ status: 'error', message: error.message });
        res.redirect('/'); //vuelve al login.
    })
})

//Redirige para que nos autentiquemos con github.
router.get('/github', passport.authenticate('github', {scope: ['user:email']}), async(req, res) => {
    res.send({ status: 'success', message: 'user registered' }); //dentro del middleware pongo "github" porque en passport.use lo llamé github. El scope tb viene de ahí.
});

//callback para que una vez autenticados con github, nos redireccione a nuestra app.
router.get('/github-callback', passport.authenticate('github', { failureRedirect: '/login' }), async(req, res) => {
    req.session.user = req.user; //en la ruta de arriba la parte de api/sessions no hace falta. La parte de session no cambia.
    res.redirect('/');
});

export default router;
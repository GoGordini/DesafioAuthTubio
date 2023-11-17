import {Router} from "express";
const router = Router();
import { productPath } from '../utils.js';
import ProductManager from '../dao/dbManager/products.manager.js';
import ChatManager from "../dao/dbManager/chat.manager.js";
import CartManager from "../dao/dbManager/carts.manager.js";
import { productsModel } from "../dao/dbManager/models/products.model.js";

const productManager= new ProductManager(productPath);
const chatManager= new ChatManager();
const cartManager= new CartManager();

const publicAccess = (req, res, next) => {
    if(req.session?.user) return res.redirect('/');
    next();
}
// middleware para ver si esá logueado o no. Si no está creado el atributo user es porque no inició sesión. Si inició sesión, redirijo al profile (si ya está logueado no mando ni a login ni a register).
// si no está el user, continúa con la ejecución normal (en el registro, ve el formulario de registro y en el login, ve el form de login).

const privateAccess = (req, res, next) => {
    if(!req.session?.user) return res.redirect('/login'); //si no tiene user es porque no inició sesión, redirijo al login.
    next();
}
//middleware para especificar qué vistas son privadas. En este caso, la única es la vista del perfil.
//Si no inicié sesión, me manda al login.

//RUTAS DE PRODUCTOS
router.get("/realtimeproducts",privateAccess,async(req,res)=>{
   try{
    const products = await productManager.getAll();
    res.render("realTimeProducts",{products:products});}
    catch(error) {return res.send({ status: 'error', error: error })}
})
router.get("/products",privateAccess,async (req,res)=>{
    try{
     const {page=1,limit=10,sort,queryValue,query} = req.query; 
     //si no manda nada, asumo page 1 y limit 10.
     const filtered = (query=="price"||query=="stock")?({[query]: { $gt: queryValue }}):((queryValue)? {[query]:{$regex: queryValue,$options:"i"}} : {});
     const sorted = sort? ({price:sort}) : ({});
     const {docs,hasPrevPage,hasNextPage,nextPage,prevPage}=await productsModel.paginate(filtered,{sort:sorted,page,limit,lean:true})
        //flags para saber si botón hacia adelante o hacia atrás. 
        //primer parámetro de paginate filtro de búsqueda; segundo parámetro parámetros de paginación. Limit fijado en 5, page viene del query. Lean por el POJO.
        const prevLink=queryValue? `/products?page=${prevPage}&limit=${limit}&queryValue=${queryValue}&query=${query}`:`/products?page=${prevPage}&limit=${limit}`;
        const nextLink = queryValue? `/products?page=${nextPage}&limit=${limit}&queryValue=${queryValue}&query=${query}`:`/products?page=${nextPage}&limit=${limit}`;
        res.render("home",{
            products:docs,
            //objeto products lo obtengo de docs
            user:req.session.user,
            hasPrevPage,
            hasNextPage,
            nextPage,
            prevPage,
            limit,
            query,
            queryValue,
            prevLink,
            nextLink
        });}
        catch(error) {return res.send({ status: 'error', error: error })}
    });
router.get("/home",privateAccess,async (req,res)=>{
        try{
            const {page=1,limit=10,sort} = req.query;
            //si no manda nada, asumo page 1 y limit 10.
    //        const {docs,hasPrevPage,hasNextPage,nextPage,prevPage}=await productsModel.paginate({},{sort:{price:1},page,limit,lean:true})
            const {docs,hasPrevPage,hasNextPage,nextPage,prevPage,totalPages}=await productsModel.paginate({},{sort:{price:sort},page,limit,lean:true});
            //flags para saber si botón hacia adelante o hacia atrás. 
            //primer parámetro de paginate filtro de búsqueda; segundo parámetro parámetros de paginación. Limit fijado en 5, page viene del query. Lean por el POJO.
            //const products = await productManager.getAll();
            const prevLink = hasPrevPage ? `/?page=${prevPage}&limit=${limit}` : null;
            const nextLink= hasNextPage ? `/?page=${nextPage}&limit=${limit}` : null;
            res.send({status:"success",payload:docs,hasPrevPage,hasNextPage,nextPage,prevPage,totalPages,page,prevLink,nextLink
            });}
            catch(error) {return res.send({ status: 'error', error: error })}
        });

//RUTA DE CARRITO
router.get("/carts/:cid",async(req,res)=>{
        try{
            const cid = req.params.cid;
            const cart = await cartManager.getCartById(cid);
            res.render("cart",{cart});
        }
        catch(error){
            console.error(error.message);
        }
    });

//RUTA DE CHAT
router.get("/chat",privateAccess,async(req,res)=>{
    const messages = await chatManager.getAll();
    res.render("chat",{messages});
})

//RUTAS DE USUARIOS
//register y login son de acceso público; aplico el middleware publicAccess.
router.get('/register', publicAccess, (req, res) => {
    res.render('register')
});

router.get('/login', publicAccess, (req, res) => {
    res.render('login')
});

//acá aplico el middleware privateAccess.
router.get('/', privateAccess, (req, res) => {
    res.render('profile', {
        user: req.session.user
    })
});

export default router;


// import { Router } from 'express';

// const router = Router();

// router.get('/login', (req, res) => {
//     res.render('login');
// });

// router.get('/', (req, res) => {
//     res.render('home2');
// })

// export default router;
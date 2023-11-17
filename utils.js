import { fileURLToPath } from 'url';
import { dirname,join } from 'path';
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const productPath = join (__dirname,"./files/productos.json");
export const  cartPath = join (__dirname, "./files/carritos.json")

//1. hashear nuestra contraseña
export const createHash = password => //paso como parámetro password a hashear
        bcrypt.hashSync(password, bcrypt.genSaltSync(10)); //primer parámetro es lo que quiero hashear, segundo el número de rondas de hasheo (se recomienda 10)
    //1234
    //ASDASD435@#$#$

//2. validar nuestro password
export const isValidPassword = (plainPassword, hashedPassword) => //plainpassword es lo que valida el usuario, hashedpassword es lo que ya tenemos guardado hasheado.
    bcrypt.compareSync(plainPassword, hashedPassword);

// export {
//     __dirname,
//     createHash,
//     isValidPassword
// }
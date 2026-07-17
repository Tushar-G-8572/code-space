import { config } from '../config/config.js';
import jwt from 'jsonwebtoken'

export function createToken(id){
 const token = jwt.sign({id},config.GITHUB_JWT_SECRET,{expiresIn:'1d'});
 return token
}

export function verifyToken(token){
 return jwt.verify(token,config.GITHUB_JWT_SECRET);
}


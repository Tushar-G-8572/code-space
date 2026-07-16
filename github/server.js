import app from "./src/app.js";
import configPassport from "./src/config/passport.config.js";

configPassport();

app.listen(3000,()=>{
 console.log('server is running on port 3000');
})
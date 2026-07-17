import { config } from "./src/config/config.js";
import app from "./src/app.js";
import configPassport from "./src/config/passport.config.js";
import { connectDB } from "./src/config/db.config.js";

connectDB();
configPassport();

app.listen(config.PORT,()=>{
 console.log(`server is running on port ${config.PORT}`);
})
import app from "./src/app.js";
import { connectToDB } from "./src/config/db.js";

connectToDB();

app.listen(3000,()=>{
 console.log("Sandbox server is running on 3000")
})
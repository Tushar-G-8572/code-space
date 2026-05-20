import axios from "axios";
import { tool } from "langchain"
import * as z from 'zod';
import dns from "node:dns";
import http from "node:http";
const SANDBOX_ID = "019e45e4-d6c1-77fb-8f71-efd0194a64cf";
const BASE_URL = `http://${SANDBOX_ID}.agent.localhost`;

const httpAgent = new http.Agent({
 lookup: (hostname, options, callback) => {
  const cb = typeof options === "function" ? options : callback;
  const opts = typeof options === "function" ? {} : options;
  if (hostname.endsWith(".agent.localhost")) {
   if (opts?.all) {
    return cb(null, [{ address: "127.0.0.1", family: 4 }]);
   }
   return cb(null, "127.0.0.1", 4);
  }
  return dns.lookup(hostname, opts, cb);
 },
});

const api = axios.create({
  httpAgent,
    headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  transformRequest: [
    (data) => JSON.stringify(data)  // force JSON serialization
  ]
  
});



export const listFiles = tool(async({})=>{
 try{
  console.log("List files Called")
  const response = await api.get(`${BASE_URL}/list-files`)
  console.log(response.data)
  return JSON.stringify(response.data.files);
 }catch(err){
  console.log(err);
  return JSON.stringify(err);
 }
},{
        name: "list_files",
        description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({})
})

export const readFiles = tool(async({files})=>{

 console.log("Read Files called");
 const response = await api.get(`${BASE_URL}/read-files?files=${files.join(',')}`)
  console.log("response from read files tool", response.data)
 return JSON.stringify(response.data)

},{
        name: "read_files",
        description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later")
        })
})
api.interceptors.request.use((config) => {
  console.log("=== OUTGOING REQUEST ===");
  console.log("URL:", config.url);
  console.log("Method:", config.method);
  console.log("Headers:", config.headers);
  console.log("Data:", config.data);
  console.log("=======================");
  return config;
});
export const updateFile = tool(async({files})=>{
  
try {

   console.log("Update files called");
    console.log(files);
   const response = await api.patch(
  `${BASE_URL}/update-files`,
  { updates: files },
)

   console.log(response.data);

   return JSON.stringify(response.data);

  } catch (err) {

   console.error(err.response?.data || err.message);

   return `Update failed: ${err.message}`;
  }
 },
{
        name: "update_files",
        description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand. this tool can also use to create new files by providing a new file name in the file field and the content to be added in the content field.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe("The absolute path of the file to update"),
                content: z.string().describe("The new content for the file, the content should support json format.")
            })).describe("The list of files to update and their new contents")
        })
    })
import axios from "axios";
import { tool } from "langchain"
import * as z from 'zod';

export const listFiles = tool(async ({ }, config) => {
  try {
     const writer = config.context?.writer ?? (() => {});
    writer("List files read successfully.\n");
    const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/list-files`)
    writer("Files listed successfully." + "Files: " + response.data.files.join(",") + "\n");
    return JSON.stringify(response.data.files);
  } catch (err) {
    console.log(err); 
    return JSON.stringify(err);
  }
}, {
  name: "list_files",
  description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
  schema: z.object({})
})

axios.interceptors.request.use((config) => {
  console.log("=== OUTGOING REQUEST ===");
  console.log("URL:", config.url);
  console.log("Method:", config.method);
  console.log("Headers:", config.headers);
  console.log("Data:", config.data);
  console.log("=======================");
  return config;
});

export const readFiles = tool(async ({ files }, config) => {

   const writer = config.context?.writer ?? (() => {});
  writer("Reading files..." + files.join(",") + "\n");
  
  const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/read-files?files=${files.join(',')}`,
  {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  })
   writer("Files read successfully.\n");
  return JSON.stringify(response.data)

}, {
  name: "read_files",
  description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
  schema: z.object({
    files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later")
  })
})

axios.interceptors.request.use((config) => {
  console.log("=== OUTGOING REQUEST ===");
  console.log("URL:", config.url);
  console.log("Method:", config.method);
  console.log("Headers:", config.headers);
  console.log("Data:", config.data);
  console.log("=======================");
  return config;
});


export const updateFile = tool(async ({ files }, config) => {

  try {
    const writer = config.context?.writer ?? (() => {});
    writer("Updating files..." + files.map(f => f.file).join(",") + "\n");
    const response = await axios.patch(`http://sandbox-service-${config.context.projectId}:3000/update-files`,
      { updates: files },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
     writer("Update read successfully.\n");

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
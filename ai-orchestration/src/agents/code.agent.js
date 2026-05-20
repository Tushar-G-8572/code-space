import {ChatMistralAI} from '@langchain/mistralai'
import 'dotenv/config';
import {createAgent} from 'langchain'
import { listFiles,updateFile,readFiles } from './agent.tools.js';

const model = new ChatMistralAI({
 apiKey:process.env.MISTRAL_API_KEY,
 model:'mistral-large-latest',
 temperature:0.7,
})

const agent = createAgent({
 model,
 tools:[listFiles,updateFile,readFiles],
})

await agent.invoke({
  messages: [
    {
      role: "user",
      content: "can you change the project theme to light"
    }
  ]
});
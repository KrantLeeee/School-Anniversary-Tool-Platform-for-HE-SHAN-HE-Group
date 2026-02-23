import { SchoolResearchAssistantAgent } from './lib/agents/tools/school-research-assistant.ts'

async function run() {
    const agent = new SchoolResearchAssistantAgent()
    
    console.log("Starting model ID:", agent.getModelId())
    const stream = agent.streamChat({
        message: "你好",
        userId: "testId"
    })
    
    let count = 0
    for await (const chunk of stream) {
        console.log("YIELD:", JSON.stringify(chunk))
        count++
    }
    
    console.log("Total chunks:", count)
}

run().catch(console.error)

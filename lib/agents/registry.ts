import { Agent } from './core'
import { Scene3DGeneratorAgent } from './tools/scene-3d-generator'

/**
 * Agent Registry
 * Maps an internal database Tool ID to its corresponding Agent Implementation
 */
export class AgentRegistry {
    private static agents: Record<string, typeof Scene3DGeneratorAgent> = {
        // Map the database `cozeBotId` or `Tool.id` to an Agent. 
        // Usually, we map an internal string identifier defined in the DB's cozeBotId field 
        // to distinguish it from actual Coze bots now.
        'scene-3d-generator': Scene3DGeneratorAgent,
    }

    /**
     * Retrieves an agent instance by its ID
     * @param agentId The identifier of the agent (stored in tool.cozeBotId in the DB)
     * @returns Instantiated Agent or null if not found
     */
    static getAgent(agentId: string): Agent | null {
        const AgentClass = this.agents[agentId]
        if (!AgentClass) {
            console.warn(`[AgentRegistry] Agent not found for ID: ${agentId}`)
            return null
        }
        // We instantiate lazily
        return new AgentClass()
    }

    /**
     * Fallback default agent if ID is missing or invalid
     */
    static getDefaultAgent(): Agent {
        return new Scene3DGeneratorAgent()
    }
}

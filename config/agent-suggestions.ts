/**
 * Agent Suggestions Configuration
 * 
 * Mapping of tool IDs (from prisma/seed.ts) to their specific sample prompts.
 */

export interface AgentConfig {
    suggestions: string[];
}

export const AGENT_CONFIG_MAP: Record<string, AgentConfig> = {
    // 校园场景 3D 底图生成助手
    'default-tool': {
        suggestions: [
            '帮我把这张校园广场照片转成3D建模风格',
            '生成一个阳光明媚的校园操场3D底图',
            '优化这张教学楼照片，让光影更像现代建筑渲染图'
        ]
    },
    // 校史馆室内设计生成助手
    'museum-generator-tool': {
        suggestions: [
            '为校史馆的前厅设计一个具有仪式感的入口效果',
            '如何在这个狭长的走廊里布置校友墙？',
            '帮我生成一个富有科技感的数字展厅效果图'
        ]
    },
    // 校领导及校情综合调研助手
    'school-research-tool': {
        suggestions: [
            '帮我整理一下该校过去三年的校庆主题和核心活动',
            '预判一下该校今年校庆可能的重点项目方向',
            '帮我写一份该校杰出校友的背景调研提纲'
        ]
    }
};

/**
 * Get suggestions for a specific tool ID, fallback to general suggestions
 */
export function getAgentSuggestions(toolId: string): string[] {
    return AGENT_CONFIG_MAP[toolId]?.suggestions || [
        '有哪些实用的小技巧可以分享？',
        '帮我写一个简短的自我介绍',
        '你最擅长解决什么样的问题？'
    ];
}

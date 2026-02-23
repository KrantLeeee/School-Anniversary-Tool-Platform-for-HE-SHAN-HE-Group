'use server'

import { db } from '@/lib/db'

export async function getActiveTools() {
    try {
        const tools = await db.tool.findMany({
            where: { isEnabled: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                cozeType: true,
            }
        })
        return tools
    } catch (error) {
        console.error('Failed to fetch active tools', error)
        return []
    }
}

export interface Model {
    id: string
    name: string
    description: string
    complexity: number // 1-4 scale for visual usage indication
    badge: string
}

export const MODELS: Model[] = [
    {
        id: 'sonar',
        name: 'Sonar',
        description: 'Fast, lightweight model optimized for quick search queries.',
        complexity: 1,
        badge: 'Fast'
    },
    {
        id: 'sonar-pro',
        name: 'Sonar Pro',
        description: 'Enhanced capabilities for deeper research and comprehensive answers.',
        complexity: 2,
        badge: 'Pro'
    },
    {
        id: 'sonar-reasoning',
        name: 'Sonar Reasoning',
        description: 'Specialized for logical tasks, coding, and complex problem solving.',
        complexity: 3,
        badge: 'Logic'
    },
    {
        id: 'sonar-reasoning-pro',
        name: 'Sonar Reasoning Pro',
        description: 'Maximum reasoning power with extended context and depth.',
        complexity: 4,
        badge: 'Max'
    },
]

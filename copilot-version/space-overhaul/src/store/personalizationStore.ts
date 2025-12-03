import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
    leanScore: number; // -1 (Left) to 1 (Right)
    topics: Record<string, number>; // Topic -> Interest Score
    history: string[]; // Article IDs
}

interface PersonalizationState {
    preferences: UserPreferences;
    trackView: (articleId: string, leaning: 'LEFT' | 'RIGHT' | 'CENTER', topic: string) => void;
    getRecommendations: (articles: any[]) => any[];
}

export const usePersonalization = create<PersonalizationState>()(
    persist(
        (set, get) => ({
            preferences: {
                leanScore: 0,
                topics: {},
                history: [],
            },
            trackView: (articleId, leaning, topic) => {
                set((state) => {
                    const leanImpact = leaning === 'LEFT' ? -0.1 : leaning === 'RIGHT' ? 0.1 : 0;
                    const newLeanScore = Math.max(-1, Math.min(1, state.preferences.leanScore + leanImpact));

                    const newTopics = { ...state.preferences.topics };
                    newTopics[topic] = (newTopics[topic] || 0) + 1;

                    return {
                        preferences: {
                            leanScore: newLeanScore,
                            topics: newTopics,
                            history: [...state.preferences.history, articleId],
                        },
                    };
                });
            },
            getRecommendations: (articles) => {
                const { preferences } = get();
                return articles.sort((a, b) => {
                    // Simple scoring: Match lean + Match topic
                    const scoreA = (a.leaning === 'LEFT' && preferences.leanScore < 0) || (a.leaning === 'RIGHT' && preferences.leanScore > 0) ? 1 : 0;
                    const scoreB = (b.leaning === 'LEFT' && preferences.leanScore < 0) || (b.leaning === 'RIGHT' && preferences.leanScore > 0) ? 1 : 0;
                    return scoreB - scoreA;
                });
            },
        }),
        {
            name: 'user-personalization',
        }
    )
);

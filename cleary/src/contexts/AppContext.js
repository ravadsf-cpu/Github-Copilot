import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [currentMood, setCurrentMood] = useState('recommended');
  const [userPreferences, setUserPreferences] = useState({
    topics: ['economy', 'science', 'war', 'politics'],
    excludeTopics: [],
    politicalBalance: 'reinforce', // balanced, challenge, reinforce
  });
  const [readingHistory, setReadingHistory] = useState([]);
  const [backgroundMood, setBackgroundMood] = useState('neutral');

  const trackArticleInteraction = (article, interaction) => {
    const historyItem = {
      article,
      interaction, // read, skipped, saved
      timestamp: Date.now(),
      readTime: interaction.readTime || 0
    };
    setReadingHistory(prev => [historyItem, ...prev.slice(0, 99)]);
  };

  const updateMood = (mood) => {
    setCurrentMood(mood);
    setBackgroundMood(mood);
  };

  const value = {
    currentMood,
    setCurrentMood: updateMood,
    userPreferences,
    setUserPreferences,
    readingHistory,
    trackArticleInteraction,
    backgroundMood,
    setBackgroundMood
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

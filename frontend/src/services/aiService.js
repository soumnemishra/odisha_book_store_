import apiClient from './apiClient';

export const aiService = {
  getRecommendations: () => apiClient.get('/ai/recommendations'),
  aiSearch: (query) => apiClient.post('/ai/search', { query }),
};


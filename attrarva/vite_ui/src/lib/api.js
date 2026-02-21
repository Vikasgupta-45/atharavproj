import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001',
    headers: { 'Content-Type': 'application/json' },
});

export const submitGameAnswer = async (gameType, userInput, context = {}, hintUsed = false) => {
    const res = await api.post('/game/verify', { game_type: gameType, user_input: userInput, context, hint_used: hintUsed });
    return res.data;
};

export const getDynamicPrompt = async (gameType) => {
    const res = await api.post('/game/prompt', { game_type: gameType });
    return { promptData: res.data.prompt_data, hint: res.data.hint };
};

export const refillHearts = async () => {
    const res = await api.post('/user/refill-hearts');
    return res.data;
};

export const getUserStats = async () => {
    const res = await api.get('/user/stats');
    return res.data;
};

export const getLeaderboard = async () => {
    const res = await api.get('/leaderboard');
    return res.data;
};

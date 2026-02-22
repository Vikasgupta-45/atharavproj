import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8002',
    headers: { 'Content-Type': 'application/json' },
});

export const submitGameAnswer = async (gameType, userInput, context = {}, hintUsed = false, userId = 'guest_user') => {
    const res = await api.post('/game/verify',
        { game_type: gameType, user_input: userInput, context, hint_used: hintUsed },
        { headers: { 'X-User-ID': userId } }
    );
    return res.data;
};

export const getDynamicPrompt = async (gameType, userId = 'guest_user') => {
    const res = await api.post('/game/prompt',
        { game_type: gameType },
        { headers: { 'X-User-ID': userId } }
    );
    return { promptData: res.data.prompt_data, hint: res.data.hint };
};

export const refillHearts = async (userId = 'guest_user') => {
    const res = await api.post('/user/refill-hearts', {}, { headers: { 'X-User-ID': userId } });
    return res.data;
};

export const getUserStats = async (userId = 'guest_user') => {
    const res = await api.get('/user/stats', { headers: { 'X-User-ID': userId } });
    return res.data;
};

export const getLeaderboard = async () => {
    const res = await api.get('/leaderboard');
    return res.data;
};

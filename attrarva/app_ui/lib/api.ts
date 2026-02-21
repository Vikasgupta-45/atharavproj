import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001",
    headers: {
        "Content-Type": "application/json",
    },
});

export const submitGameAnswer = async (gameType: string, userInput: string, context: Record<string, any> = {}, hintUsed: boolean = false) => {
    const payload = {
        game_type: gameType,
        user_input: userInput,
        context,
        hint_used: hintUsed
    };
    const response = await api.post("/game/verify", payload);
    return response.data;
};

export const getDynamicPrompt = async (gameType: string) => {
    const response = await api.post("/game/prompt", { game_type: gameType });
    return {
        promptData: response.data.prompt_data,
        hint: response.data.hint
    };
};

export const refillHearts = async () => {
    const response = await api.post("/user/refill-hearts");
    return response.data;
};

export const getUserStats = async () => {
    const response = await api.get("/user/stats");
    return response.data;
};

export const getLeaderboard = async () => {
    const response = await api.get("/leaderboard");
    return response.data;
};

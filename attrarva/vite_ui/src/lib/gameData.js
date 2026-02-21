export const REDUNDANCY_PROMPTS = [
    { bad: "I want to repeat again.", good: "I want to repeat." },
    { bad: "They arrived at 12 midnight.", good: "They arrived at midnight." },
    { bad: "The end result was surprising.", good: "The result was surprising." },
    { bad: "He nodded his head in agreement.", good: "He nodded in agreement." },
    { bad: "It is absolutely essential to go.", good: "It is essential to go." },
    { bad: "They collaborated together on the project.", good: "They collaborated on the project." },
    { bad: "I need to rethink my past history.", good: "I need to rethink my history." },
    { bad: "He gave a free gift to his friend.", good: "He gave a gift to his friend." },
];

export const SENTENCE_BUILDER_PROMPTS = [
    { words: ["dog", "the", "barking", "is", "loudly"], target: "the dog is barking loudly." },
    { words: ["jumps", "fox", "brown", "quick", "the"], target: "the quick brown fox jumps." },
    { words: ["coding", "she", "night", "all", "loves"], target: "she loves coding all night." },
    { words: ["apple", "ate", "an", "yesterday", "he"], target: "he ate an apple yesterday." },
    { words: ["fast", "very", "runs", "cheetah", "the"], target: "the cheetah runs very fast." },
];

export const SENTENCE_RECONSTRUCTOR_PROMPTS = [
    { original: "Yo, the meeting is gonna start soon so get in here.", tone: "formal" },
    { original: "Send me that file whenever you get a sec.", tone: "formal" },
    { original: "We need to fix this bug super fast.", tone: "formal" },
    { original: "That idea is totally whacked out.", tone: "professional" },
    { original: "The boss was pretty mad about the delay.", tone: "diplomatic" },
];

export const PLOT_HOLE_PROMPTS = [
    { story: "Rahul went to Delhi. Rahul in Mumbai was walking.", hole: "There is a contradiction because he didn't travel." },
    { story: "The door was locked from the outside. He walked out and closed it.", hole: "He cannot lock it from the outside without exiting first." },
    { story: "It was pitch black outside at noon.", hole: "It shouldn't be pitch black at noon unless there's an eclipse." },
    { story: "He drowned in the desert sand.", hole: "You cannot drown in sand, only suffocate or sink." },
];

export const TONE_SWITCHER_PROMPTS = [
    "I have to do this task today.",
    "The meeting is scheduled for tomorrow morning.",
    "I am eating a sandwich right now.",
    "She walked to the store to buy milk.",
    "My computer crashed and I lost my work.",
];

export const WORD_CHOICE_PROMPTS = [
    "happy", "sad", "fast", "slow", "smart", "angry", "brave", "tired", "beautiful", "scary"
];

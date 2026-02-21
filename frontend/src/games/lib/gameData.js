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

export const DIALOGUE_DETECTIVE_PROMPTS = [
    {
        dialogue: [
            { speaker: "A", text: "Officer, I was at home all night watching movies." },
            { speaker: "B", text: "Then why did the neighbor seen you at the park?" }
        ],
        suspicious_line_index: 1,
        correct_version: "Then why did the neighbor see you at the park?"
    },
    {
        dialogue: [
            { speaker: "A", text: "The treasure is buried under the old oak tree." },
            { speaker: "B", text: "But that tree was cutted down ten years ago!" }
        ],
        suspicious_line_index: 1,
        correct_version: "But that tree was cut down ten years ago!"
    }
];

export const CONTEXT_CLIMBER_PROMPTS = [
    {
        setup: "The sky turned dark as the first drops of rain began to fall. Sarah realized she had left her umbrella at the cafe.",
        goal: "Write a sentence describing what Sarah does next to stay dry."
    },
    {
        setup: "The space capsule hummed with energy as it approached the alien planet. Deep red clouds swirled below the landing gear.",
        goal: "Write a sentence about the crew's reaction to the view."
    }
];

export const WORD_MASTER_PROMPTS = [
    { bad: "She don't like apples.", good: "She doesn't like apples.", difficulty: 1 },
    { bad: "Every of the students were here.", good: "Every student was here.", difficulty: 5 },
    { bad: "If I was you, I would go.", good: "If I were you, I would go.", difficulty: 8 }
];

export const STORY_SPINNER_PROMPTS = [
    { keyword: "Mystery", goal: "Write 3 sentences about finding an old key." },
    { keyword: "Cyberpunk", goal: "Write 3 sentences about a neon city in the rain." }
];

export const LOGIC_MCQ_PROMPTS = [
    {
        question: "Which of these is the correct past participle of 'fly'?",
        options: ["Flew", "Flown", "Flied", "Flyed"],
        answer_index: 1
    },
    {
        question: "Select the sentence with the correct punctuation.",
        options: [
            "Wait for me, I'm coming.",
            "Wait for me; I'm coming.",
            "Wait for me I'm coming.",
            "Wait for me: I'm coming."
        ],
        answer_index: 1
    }
];

export const VISUAL_VOCAB_PROMPTS = [
    {
        image_description: "A steaming cup of brown liquid on a saucer next to a croissant.",
        options: ["Tea", "Coffee", "Soup", "Milk"],
        answer_index: 1
    },
    {
        image_description: "A majestic animal with a long trunk and large grey ears.",
        options: ["Hippo", "Elephant", "Rhino", "Giraffe"],
        answer_index: 1
    }
];

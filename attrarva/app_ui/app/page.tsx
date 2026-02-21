import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default function Dashboard() {
    const games = [
        { id: "tone-switcher", title: "Tone Switcher", desc: "Rewrite sentences with different emotions." },
        { id: "word-choice", title: "Word Choice Duel", desc: "Find the perfect synonym." },
        { id: "redundancy", title: "Redundancy Eraser", desc: "Remove extra words." },
        { id: "sentence-builder", title: "Sentence Builder", desc: "Assemble sentences correctly." },
        { id: "reconstructor", title: "Sentence Reconstructor", desc: "Rewrite without changing meaning." },
        { id: "plot-hole", title: "Plot Hole Hunter", desc: "Find logical contradictions." },
    ];

    return (
        <div className="p-10 max-w-5xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back.</h1>
                <p className="text-gray-500 text-lg">Ready to refine your writing skills today?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <Link href={`/play/${game.id}`} key={game.id}>
                        <div className="group bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand transition-all cursor-pointer h-full flex flex-col items-start justify-between">
                            <div>
                                <div className="bg-brand/20 p-3 rounded-full mb-4 inline-block group-hover:bg-brand transition-colors">
                                    <PlayCircle className="text-brand-dark" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{game.desc}</p>
                            </div>
                            <div className="mt-6 font-medium text-brand-dark group-hover:underline">
                                Play Lesson &rarr;
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

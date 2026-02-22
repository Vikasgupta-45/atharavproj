import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ArrowRightLeft, Globe, Loader2, Check } from 'lucide-react';
import { apiGetLanguages, apiTranslate } from '../services/api';

const LanguageSupport = ({ text, onTranslated }) => {
    const [languages, setLanguages] = useState([]);
    const [targetLang, setTargetLang] = useState('hi-IN');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchLangs = async () => {
            try {
                const data = await apiGetLanguages();
                setLanguages([{ code: 'en-IN', name: 'English' }, ...data]);
            } catch (err) {
                console.error('Failed to fetch languages', err);
            }
        };
        fetchLangs();
    }, []);

    const handleTranslate = async () => {
        if (!text || !text.trim()) return;
        setLoading(true);
        try {
            const data = await apiTranslate({ text, target_language: targetLang });
            console.log('Translation API Data:', data);
            if (data.translated_text) {
                onTranslated(data.translated_text);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            }
        } catch (err) {
            console.error('Translation failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] transition-all hover:bg-[#CCFBF1]"
            >
                <Languages size={14} />
                {isOpen ? 'Close Multilingual Tool' : 'Multilingual Support'}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-12 z-50 w-64 glass-card p-4 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center gap-2 text-[#0D9488] border-b border-[#CCFBF1] pb-2">
                            <Globe size={16} />
                            <span className="text-sm font-black uppercase tracking-widest">Translate Document</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Language</label>
                            <select
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="w-full rounded-xl border border-[#CCFBF1] bg-white px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-[#0D9488]"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleTranslate}
                            disabled={loading || !text}
                            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${success ? 'bg-green-500 text-white' : 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : success ? (
                                <Check size={18} />
                            ) : (
                                <ArrowRightLeft size={18} />
                            )}
                            {loading ? 'Translating...' : success ? 'Done!' : 'Translate Now'}
                        </button>

                        <p className="text-[9px] text-gray-400 text-center leading-relaxed font-medium">
                            Powered by Sarvam AI - Supporting 22+ Indian Languages for native content creation.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSupport;

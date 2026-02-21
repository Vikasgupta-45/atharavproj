import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Copy, Check, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function ImageScanner() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [extractedText, setExtractedText] = useState('');
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setExtractedText('');
            setProgress(0);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setExtractedText('');
            setProgress(0);
        }
    };

    const scanImage = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const { data: { text } } = await Tesseract.recognize(
                image,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );
            setExtractedText(text);
        } catch (err) {
            console.error('OCR Error:', err);
            setExtractedText('Failed to extract text. Please try a clearer image.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearAll = () => {
        setImage(null);
        setPreview(null);
        setExtractedText('');
        setProgress(0);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen">
            <header className="mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-extrabold text-gray-900 mb-2"
                >
                    Image <span className="text-[#0D9488]">Scanner</span>
                </motion.h1>
                <p className="text-gray-500 text-lg">Extract text from handwritten notes or documents using AI OCR.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <motion.div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center min-h-[300px] cursor-pointer
                            ${preview ? 'border-[#0D9488] bg-[#F0FDFA]' : 'border-[#CCFBF1] hover:border-[#0D9488] bg-white'}`}
                        onClick={() => !preview && fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <div className="relative w-full h-full flex flex-col items-center">
                                <img src={preview} alt="Preview" className="max-h-[200px] rounded-xl shadow-lg mb-4 object-contain" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearAll(); }}
                                    className="absolute -top-4 -right-4 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                >
                                    <X size={16} />
                                </button>
                                <p className="text-sm font-medium text-[#0D9488]">{image.name}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="p-4 bg-[#F0FDFA] rounded-full inline-block mb-4">
                                    <Upload className="text-[#0D9488]" size={32} />
                                </div>
                                <p className="text-gray-600 font-bold mb-1">Drop your image here</p>
                                <p className="text-gray-400 text-sm">Or click to browse files</p>
                            </div>
                        )}
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                        />
                    </motion.div>

                    <button
                        onClick={scanImage}
                        disabled={!image || loading}
                        className={`w-full py-4 rounded-2xl font-bold text-xl transition-all shadow-glow flex items-center justify-center gap-3
                            ${!image || loading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#0D9488] text-white hover:bg-[#0F766E] active:scale-[0.98]'}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Scanning {progress}%...
                            </>
                        ) : (
                            <>
                                <ImageIcon size={24} />
                                Start Scanning
                            </>
                        )}
                    </button>
                </div>

                {/* Result Section */}
                <div className="flex flex-col h-full">
                    <div className="bg-white border-2 border-[#CCFBF1] rounded-3xl p-6 flex-1 flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-[#F0FDFA] pb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="text-[#0D9488]" size={20} />
                                <h3 className="font-extrabold text-[#0D9488]">Extracted Text</h3>
                            </div>
                            {extractedText && (
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-[#F0FDFA] rounded-xl transition text-gray-500"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check className="text-green-500" size={20} /> : <Copy size={20} />}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
                            {extractedText ? (
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                                    {extractedText}
                                </p>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                    <FileText size={48} className="mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Text will appear here after scanner finishes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

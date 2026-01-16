import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ImageGallery - Advanced image viewer with zoom and lightbox
 * Features: Magnifying zoom, thumbnail nav, fullscreen mode
 */
const ImageGallery = ({ images = [], title = 'Product' }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const imageContainerRef = useRef(null);

    // Default placeholder if no images
    const displayImages = images.length > 0 ? images : [null];
    const currentImage = displayImages[selectedIndex];

    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({ x, y });
    };

    const handleMouseEnter = () => setIsZooming(true);
    const handleMouseLeave = () => setIsZooming(false);

    const nextImage = () => {
        setSelectedIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = () => {
        setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    return (
        <>
            <div className="w-full max-w-md mx-auto">
                {/* Main Image Container */}
                <div
                    ref={imageContainerRef}
                    className="relative bg-white rounded-2xl shadow-2xl overflow-hidden cursor-zoom-in group"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setIsLightboxOpen(true)}
                >
                    {currentImage ? (
                        <div className="relative aspect-[3/4] overflow-hidden">
                            {/* Normal Image */}
                            <img
                                src={currentImage}
                                alt={`${title} - Image ${selectedIndex + 1}`}
                                className={`w-full h-full object-cover transition-opacity duration-200 ${isZooming ? 'opacity-0' : 'opacity-100'}`}
                            />

                            {/* Zoomed Image (desktop only) */}
                            <div
                                className={`absolute inset-0 hidden md:block transition-opacity duration-200 ${isZooming ? 'opacity-100' : 'opacity-0'}`}
                                style={{
                                    backgroundImage: `url(${currentImage})`,
                                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                    backgroundSize: '200%',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />

                            {/* Zoom Indicator */}
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                Click to expand
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center">
                            <span className="text-8xl mb-4">📚</span>
                            <span className="text-gray-400 text-sm">No image available</span>
                        </div>
                    )}

                    {/* Navigation Arrows (if multiple images) */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                            >
                                ‹
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnail Strip */}
                {displayImages.length > 1 && (
                    <div className="flex gap-2 mt-4 justify-center">
                        {displayImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedIndex(idx)}
                                className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedIndex === idx
                                        ? 'border-primary shadow-lg scale-105'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {img ? (
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">📚</div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Image Counter Badge */}
                {displayImages.length > 1 && (
                    <div className="text-center mt-2 text-sm text-gray-500">
                        {selectedIndex + 1} / {displayImages.length}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && currentImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors text-2xl"
                        >
                            ×
                        </button>

                        {/* Navigation */}
                        {displayImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors text-3xl"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors text-3xl"
                                >
                                    ›
                                </button>
                            </>
                        )}

                        {/* Full Size Image */}
                        <motion.img
                            key={selectedIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={currentImage}
                            alt={title}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Image Counter */}
                        {displayImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm">
                                {selectedIndex + 1} / {displayImages.length}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ImageGallery;

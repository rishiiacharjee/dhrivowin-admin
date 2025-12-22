import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Newspaper, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewsBanner = () => {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [news.length]);

  const fetchNews = async () => {
    try {
      const response = await api.get('/news');
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news');
    }
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % news.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);

  if (news.length === 0) {
    return (
      <div className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-8 text-center">
        <Newspaper className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold font-['Chakra_Petch']">STAY TUNED!</h3>
        <p className="text-zinc-400">Latest news and updates coming soon</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-yellow-400" />
          LATEST <span className="text-yellow-400">NEWS</span>
        </h2>
        {news.length > 1 && (
          <div className="flex gap-2">
            <button onClick={prevSlide} className="p-2 bg-zinc-800 hover:bg-zinc-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextSlide} className="p-2 bg-zinc-800 hover:bg-zinc-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-yellow-400 font-bold uppercase mb-2 block">
                  {new Date(news[currentIndex]?.created_at).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-['Chakra_Petch'] mb-2">
                  {news[currentIndex]?.title}
                </h3>
                <p className="text-zinc-400 text-sm md:text-base">
                  {news[currentIndex]?.content}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        {news.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {news.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-yellow-400 w-6' : 'bg-zinc-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 transform rotate-45 translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/5 transform rotate-45 -translate-x-12 translate-y-12" />
      </div>

      {/* News List */}
      {news.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {news.slice(0, 3).map((item, i) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(i)}
              className={`text-left p-4 transition-all ${
                i === currentIndex 
                  ? 'bg-yellow-400/20 border border-yellow-400' 
                  : 'bg-zinc-900/50 border border-white/10 hover:border-yellow-400/50'
              }`}
            >
              <p className="text-xs text-zinc-500 mb-1">
                {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
              <p className="font-semibold text-sm truncate">{item.title}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsBanner;

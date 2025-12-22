import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Newspaper } from 'lucide-react';

const NewsTicker = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/news');
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news');
    }
  };

  if (news.length === 0) return null;

  return (
    <div className="bg-zinc-900/50 border-y border-white/10 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-yellow-400 px-4 py-2 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-black" />
          <span className="text-black font-bold text-sm uppercase">News</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="news-ticker whitespace-nowrap py-2">
            {news.map((item, index) => (
              <span key={item.id} className="inline-block mx-8 text-zinc-300">
                <span className="text-yellow-400 mr-2">•</span>
                {item.title}
                {index < news.length - 1 && <span className="mx-8 text-zinc-600">|</span>}
              </span>
            ))}
            {/* Duplicate for seamless scroll */}
            {news.map((item, index) => (
              <span key={`dup-${item.id}`} className="inline-block mx-8 text-zinc-300">
                <span className="text-yellow-400 mr-2">•</span>
                {item.title}
                {index < news.length - 1 && <span className="mx-8 text-zinc-600">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;

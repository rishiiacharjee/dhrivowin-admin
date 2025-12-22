import { useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const shopItems = [
  {
    id: 1,
    title: "Gaming Headphones",
    description: "Pro Gaming Headset with 7.1 Surround",
    price: "₹1,999",
    image: "https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=400",
    link: "#"
  },
  {
    id: 2,
    title: "Gaming Mouse",
    description: "RGB Gaming Mouse 16000 DPI",
    price: "₹899",
    image: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=400",
    link: "#"
  },
  {
    id: 3,
    title: "Gaming Controller",
    description: "Wireless Controller for Mobile",
    price: "₹1,499",
    image: "https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=400",
    link: "#"
  },
  {
    id: 4,
    title: "Gaming Chair",
    description: "Ergonomic Pro Gaming Chair",
    price: "₹8,999",
    image: "https://images.pexels.com/photos/7862498/pexels-photo-7862498.jpeg?auto=compress&cs=tinysrgb&w=400",
    link: "#"
  }
];

const ShoppingBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shopItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % shopItems.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + shopItems.length) % shopItems.length);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-['Chakra_Petch'] flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-pink-400" />
          GAMING <span className="text-pink-400">SHOP</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={prevSlide} className="p-2 bg-zinc-800 hover:bg-zinc-700 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextSlide} className="p-2 bg-zinc-800 hover:bg-zinc-700 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 h-48 md:h-64 overflow-hidden">
              <img 
                src={shopItems[currentIndex].image} 
                alt={shopItems[currentIndex].title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <span className="text-xs text-pink-400 font-bold uppercase mb-2">Featured Product</span>
              <h3 className="text-2xl font-bold font-['Chakra_Petch'] mb-2">{shopItems[currentIndex].title}</h3>
              <p className="text-zinc-400 mb-4">{shopItems[currentIndex].description}</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-yellow-400">{shopItems[currentIndex].price}</span>
                <a 
                  href={shopItems[currentIndex].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 font-bold transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  BUY NOW
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {shopItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-pink-400' : 'bg-zinc-600'}`}
            />
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {shopItems.map((item, i) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-zinc-900/50 border p-3 transition-all hover:scale-105 ${
              i === currentIndex ? 'border-pink-500' : 'border-white/10 hover:border-pink-500/50'
            }`}
          >
            <div className="h-20 overflow-hidden mb-2">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-semibold truncate">{item.title}</p>
            <p className="text-yellow-400 font-bold">{item.price}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ShoppingBanner;

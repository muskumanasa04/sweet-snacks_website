import React from 'react';
import { Suite } from '../types';
import { Star, MapPin, Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

interface SuiteCardProps {
  suite: Suite;
  onClick: () => void;
}

export const SuiteCard: React.FC<SuiteCardProps> = ({ suite, onClick }) => {
  const { toggleFavorite, isFavorite } = useApp();
  const favorited = isFavorite(suite.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(suite.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col h-full bg-white rounded-[32px] border border-[#F5EDE8] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#3A2218]/5 transition-all duration-300"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
        <img
          src={suite.images[0] || 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=600'}
          alt={suite.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Floating Category Tag */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-[#E36D5B] border border-[#FFE1D9] uppercase tracking-widest shadow-xs">
          {suite.category}
        </div>

        {/* Favorite Sweet Heart Button with stopping propagation */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#FF7A85] hover:bg-white hover:text-[#C45543] transition duration-200 shadow-sm cursor-pointer border-none outline-none z-10"
        >
          <Heart size={15} className={favorited ? 'fill-[#FF7A85] stroke-[#FF7A85]' : 'text-gray-400'} />
        </button>

        {/* Weight & Price label tags */}
        <div className="absolute bottom-3 right-3 bg-[#3A2218]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 shadow-sm flex items-baseline gap-1 select-none">
          <span className="font-sans font-extrabold text-sm text-[#FFE6DE]">${suite.pricePerNight}</span>
          <span className="text-[9px] text-gray-300 font-normal"> / {suite.unitWeight || 'pack'}</span>
        </div>
      </div>

      {/* Info details */}
      <div className="p-5 flex flex-col flex-grow text-left">
        <div className="flex items-center justify-between text-xs text-[#A68F85] font-semibold gap-2 mb-1.5">
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-[#FF9B85] shrink-0" />
            <span className="truncate max-w-[150px]">{suite.location}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#FDF8F5] px-2.5 py-0.5 rounded-full border border-[#FFF0EA]">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[#3A2218] font-bold">{suite.rating}</span>
            <span className="text-[10px] font-medium text-[#A68F85]">({suite.reviewsCount})</span>
          </div>
        </div>

        <h3 className="font-serif text-base font-bold text-[#3A2218] tracking-tight line-clamp-1 group-hover:text-[#FF7A85] transition duration-200">
          {suite.title}
        </h3>

        <p className="text-xs text-[#6E5950] line-clamp-2 mt-2 leading-relaxed flex-grow">
          {suite.description}
        </p>

        {/* Action / Packaging Specs bar */}
        <div className="mt-4 pt-3 border-t border-[#F7EFE9] flex items-center justify-between text-xs text-[#8A756D] font-bold">
          <div className="flex items-center gap-1 text-[#FF826E] bg-[#FFF2EE] px-2.5 py-0.5 rounded-full border border-[#FFE1D9] text-[10px] uppercase font-black tracking-wider">
            <ShoppingBag size={11} className="shrink-0" />
            <span>{suite.unitWeight || "Individual Pack"}</span>
          </div>

          <div className="text-[11px] font-black text-[#FF7A85] group-hover:text-[#C45543] flex items-center gap-0.5 transition-all">
            Order Sweet <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

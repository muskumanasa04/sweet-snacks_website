import React from 'react';
import { Sparkles, Star, Award, Shield } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-12 text-left py-4 select-none">
      
      {/* Intro visual segment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-[10px] bg-[#FFF2EE] text-[#FF7A85] border border-[#FFE1D9] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Our Culinary Legacy
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#3A2218] mt-3 tracking-tight">
            Where ancestral secret recipes meet <span className="text-[#FF7A85]">pure ingredient comfort</span>.
          </h2>
          <p className="text-xs md:text-sm text-[#8A756D] leading-relaxed mt-4">
            Established in 2024, Sweets & Snacks was born out of a simple, beautiful vision: gourmet desserts shouldn't feel processed or mass-manufactured. They should wrap you in a warm hug of pure desi ghee, fresh high-grade cardamom, handpicked organic date pulp, and authentic crunch, baked in small batches.
          </p>
          <p className="text-xs md:text-sm text-[#8A756D] leading-relaxed mt-3">
            Today, we host a highly curated portfolio of independent veteran chefs, home kitchens, and traditional spice blenders. Each sweet batch and crunch recipe underwent rigorous lab-grade standard tests and taste-panel checks by our sweets audit board to guarantee zero artificial colors, zero fake preservatives, and outstanding gourmet ratings.
          </p>
        </div>

        {/* Story Illustration Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square bg-gray-150 rounded-3xl overflow-hidden shadow-sm border border-[#FAEDE4]">
            <img
              src="https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=350"
              alt="Artisan Sweets Platter"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="aspect-square bg-gray-150 rounded-3xl overflow-hidden shadow-sm border border-[#FAEDE4] mt-6 md:mt-8">
            <img
              src="https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=350"
              alt="Homemade Confections Box"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Core values segment */}
      <div className="border-t border-[#F5EDE8] pt-10">
        <h3 className="font-serif text-lg font-bold text-[#3A2218] text-center mb-8">What Makes A Recipe "Sweets & Snacks" Worthy?</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#FFFDFC] border border-[#FAF1EB] hover:border-[#FFD9CE] transition duration-200 p-5 rounded-2xl flex flex-col gap-2">
            <div className="h-9 w-9 rounded-full bg-[#FFF2EE] text-[#FF7A85] flex items-center justify-center font-bold text-sm">
              🍬
            </div>
            <h4 className="font-serif text-sm font-bold text-[#331E14]">Confection Comfort</h4>
            <p className="text-[11px] text-[#8A756D] leading-relaxed">
              Every item is handmade using premium ingredients — from organic Kashmiri saffron and cold-press coconut oil to premium stone-ground chickpea flour with roasted cashews.
            </p>
          </div>

          <div className="bg-[#FFFDFC] border border-[#FAF1EB] hover:border-[#FFD9CE] transition duration-200 p-5 rounded-2xl flex flex-col gap-2">
            <div className="h-9 w-9 rounded-full bg-[#FFF2EE] text-[#FF9B85] flex items-center justify-center font-bold text-sm">
              🛡️
            </div>
            <h4 className="font-serif text-sm font-bold text-[#331E14]">Hygiene Vetted & Approved</h4>
            <p className="text-[11px] text-[#8A756D] leading-relaxed">
              Our food safety panel checks every kitchen. Double vacuum-sealed safe-pack wrapping ensures pristine condition and unmatched shelf-life, direct to your door.
            </p>
          </div>

          <div className="bg-[#FFFDFC] border border-[#FAF1EB] hover:border-[#FFD9CE] transition duration-200 p-5 rounded-2xl flex flex-col gap-2">
            <div className="h-9 w-9 rounded-full bg-[#FFF2EE] text-[#8FBC8F] flex items-center justify-center font-bold text-sm">
              ★
            </div>
            <h4 className="font-serif text-sm font-bold text-[#331E14]">Guilt-Free Sweets</h4>
            <p className="text-[11px] text-[#8A756D] leading-relaxed">
              Includes healthy, raw, stevia-sweetened cardamom, low glycemic bites, and keto/diabetic-friendly options packed with nutritious chia seeds.
            </p>
          </div>
        </div>
      </div>

      {/* Meet the founders/team */}
      <div className="border-t border-[#F5EDE8] pt-10">
        <h3 className="font-serif text-lg font-bold text-[#3A2218] text-center mb-8">Meet Our Sweet Curators</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
              alt="Rose CEO"
              className="h-20 w-20 rounded-full object-cover border-2 border-[#FFD9CE] shadow-sm mb-3"
              referrerPolicy="no-referrer"
            />
            <h4 className="text-xs font-bold text-[#3A2218]">Manasa Rose</h4>
            <p className="text-[10px] text-[#FF7A85] font-bold uppercase tracking-wider mt-0.5">Aesthetic Director & Head Chef</p>
            <p className="text-[11px] text-gray-400 max-w-[180px] mt-1 leading-relaxed">Curating the pastel tones and authentic spice assortments for all holiday tins.</p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
              alt="Pierre Chef"
              className="h-20 w-20 rounded-full object-cover border-2 border-[#FFD9CE] shadow-sm mb-3"
              referrerPolicy="no-referrer"
            />
            <h4 className="text-xs font-bold text-[#3A2218]">Benjamin Carter</h4>
            <p className="text-[10px] text-[#FF9B85] font-bold uppercase tracking-wider mt-0.5">Savory Delight Specialist</p>
            <p className="text-[11px] text-gray-400 max-w-[180px] mt-1 leading-relaxed">Vetting support, customer relations, spice formulation, and cold shipment logistics.</p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="Chantal Designer"
              className="h-20 w-20 rounded-full object-cover border-2 border-[#FFD9CE] shadow-sm mb-3"
              referrerPolicy="no-referrer"
            />
            <h4 className="text-xs font-bold text-[#3A2218]">Chantal Dubois</h4>
            <p className="text-[10px] text-[#8FBC8F] font-bold uppercase tracking-wider mt-0.5">Chief Quality Architect</p>
            <p className="text-[11px] text-gray-400 max-w-[180px] mt-1 leading-relaxed">Overseeing administrative checklists, lab food certificates, and merchant on-boarding.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

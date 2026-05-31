import React, { useState } from 'react';
import { Suite, Review } from '../types';
import { useApp } from '../context/AppContext';
import { X, Star, Calendar, Users, ShieldCheck, Heart, Sparkles, MessageCirclePlus, ShoppingBag, Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuiteDetailModalProps {
  suite: Suite;
  onClose: () => void;
}

export const SuiteDetailModal: React.FC<SuiteDetailModalProps> = ({ suite, onClose }) => {
  const { addBooking, addReview, reviews, currentUser, currentRole, addContactRequest, toggleFavorite, isFavorite } = useApp();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser.address || '');
  const [deliveryPhone, setDeliveryPhone] = useState(currentUser.phone || '');
  
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);
  
  // Credit Card Form
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9812');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('425');
  const [cardName, setCardName] = useState(currentUser.name);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [revSuccess, setRevSuccess] = useState(false);

  // Direct Chef Inquiry Form
  const [chefMessage, setChefMessage] = useState('');
  const [chefInquirySuccess, setChefInquirySuccess] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Filter suite reviews
  const suiteReviews = reviews.filter(r => r.suiteId === suite.id);

  // Math totals
  const subtotal = suite.pricePerNight * quantity;
  const deliveryFee = 5.00;
  const taxAmount = parseFloat((subtotal * 0.05).toFixed(2));
  const totalAmount = subtotal + deliveryFee + taxAmount;

  const favorited = isFavorite(suite.id);

  // Send Direct Message to Chef
  const handleChefInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chefMessage.trim()) return;

    addContactRequest({
      sweetId: suite.id,
      sweetTitle: suite.title,
      chefEmail: suite.ownerEmail,
      buyerEmail: currentUser.email,
      buyerName: currentUser.name,
      buyerPhone: deliveryPhone || currentUser.phone || '+1 (555) 123-4567',
      message: chefMessage,
      whatsappNumber: '+1 555 321 9876' // Simulated chef whatsapp
    });

    setChefMessage('');
    setChefInquirySuccess(true);
    setTimeout(() => {
      setChefInquirySuccess(false);
      setShowInquiryForm(false);
    }, 4000);
  };

  // Checkout purchase
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');

    if (!deliveryDate) {
      setPayError('Please specify a valid targeted delivery date.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setPayError('Please write down your shipping address.');
      return;
    }

    if (paymentMethod === 'wallet' && (currentUser.walletBalance ?? 0) < totalAmount) {
      setPayError(`Insufficient Ghee Wallet balance ($${(currentUser.walletBalance ?? 0).toFixed(2)}) for total price $${totalAmount.toFixed(2)}. Top up or pay with Debit/Credit cards.`);
      return;
    }

    setIsPaying(true);

    // Simulate payment connection
    setTimeout(() => {
      addBooking({
        suiteId: suite.id,
        suiteTitle: suite.title,
        suiteImage: suite.images[0],
        checkIn: deliveryDate,
        checkOut: 'Standard Home Delivery',
        totalAmount,
        guestsCount: quantity, // Quantity
        deliveryAddress,
        deliveryPhone
      });

      setIsPaying(false);
      setPaySuccess(true);
    }, 1500);
  };

  // Post Review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      suiteId: suite.id,
      sweetTitle: suite.title,
      rating,
      comment
    });

    setComment('');
    setRevSuccess(true);
    setTimeout(() => setRevSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#3A2218]/50 backdrop-blur-xs z-[80] flex items-center justify-center p-3 sm:p-5 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-[#FAEDE4] text-left"
      >
        {/* Header toolbar */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={() => toggleFavorite(suite.id)}
            className="p-2 rounded-full bg-white/95 text-[#FF7A85] hover:scale-105 transition shadow-sm border border-[#FAEDE4] cursor-pointer"
          >
            <Heart size={16} className={favorited ? 'fill-[#FF7A85]' : ''} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#3A2218] text-white hover:bg-black hover:scale-105 transition shadow-sm cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body Scrollable Box */}
        <div className="overflow-y-auto flex-grow p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Photo slider, details, direct contact, and reviews */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Image & Thumbnails */}
              <div className="flex flex-col gap-3">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#FFFDFC] border border-[#FAEDE4] relative shadow-xs">
                  <img
                    src={suite.images[activeImgIdx]}
                    alt={suite.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-black/75 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-wider">
                    {suite.category}
                  </div>
                </div>

                {suite.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {suite.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIdx(idx)}
                        className={`h-14 w-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                          activeImgIdx === idx
                            ? 'border-[#FF7A85] scale-95 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Preview thumbnail" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Header */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-[#FFF2EE] text-[#FF7A85] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#FFF0EA] uppercase tracking-widest">
                    Traditional Recipe
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#3A2218] font-bold">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>{suite.rating}</span>
                    <span className="text-gray-400">({suiteReviews.length} reviews)</span>
                  </div>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A2218] tracking-tight">{suite.title}</h2>
                <div className="flex items-center gap-1.5 text-xs text-[#8A756D] font-semibold mt-1">
                  <MapPin size={13} className="text-[#FF9B85]" />
                  <span>{suite.location}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[#8FBC8F] font-bold">Chef Inbox Verified</span>
                </div>
              </div>

              {/* Chef details and direct contact button */}
              <div className="bg-[#FFF9F7] border border-[#FFEDE9] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#FF7A85] to-[#FF9B85] flex items-center justify-center text-white font-serif text-sm font-bold shadow-xs">
                      👩‍🍳
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#3A2218]">Prepared by Domestic Chef</p>
                      <p className="text-[10px] text-gray-500 font-medium truncate max-w-[180px]">{suite.ownerEmail}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(!showInquiryForm)}
                    className="px-3.5 py-2 bg-gradient-to-r from-[#FF7A85] to-[#FF9B85] hover:opacity-90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare size={13} />
                    <span>Contact Chef</span>
                  </button>
                </div>

                {/* Animated Direct Inquiry form for "Contact Owner" */}
                <AnimatePresence>
                  {showInquiryForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-[#FAEDE4] pt-3 mt-1"
                    >
                      {chefInquirySuccess ? (
                        <div className="bg-green-50 text-[#3C6E3C] p-3 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2">
                          <span className="text-base">🎉</span>
                          <span className="leading-tight">Inquiry sent successfully to Chef! The Chef will formulate a reply sent directly back to your registered WhatsApp or Email shortly. Logs updated on your activity panel.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleChefInquirySubmit} className="flex flex-col gap-2.5">
                          <p className="text-[10px] text-[#A68F85] font-semibold leading-tight">
                            Have catering questions about ingredients, bulk holiday trays, or customizable stevia sugars? Pitch Chef directly:
                          </p>
                          <textarea
                            value={chefMessage}
                            required
                            onChange={e => setChefMessage(e.target.value)}
                            placeholder="e.g. Hi chef! I am hoping to get 5 boxes of this with less red spice. Is it possible to customize our packaging for next Monday's event?"
                            className="w-full bg-white border border-[#FAEDE4] text-xs font-medium rounded-xl p-3 outline-none focus:border-[#FF7A85] min-h-[75px] max-h-[140px] text-[#3A2218]"
                          />
                          <button
                            type="submit"
                            className="bg-[#3A2218] text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-black transition self-end flex items-center gap-1 cursor-pointer"
                          >
                            <Send size={11} />
                            <span>Send Query to Chef</span>
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description context */}
              <div>
                <h4 className="font-serif text-sm font-black text-[#3A2218] mb-1.5 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles size={13} className="text-[#FF7A85]" /> Confectionary Description
                </h4>
                <p className="text-xs text-[#5C463C] leading-relaxed whitespace-pre-line bg-[#FFFDFC] p-4 rounded-2xl border border-[#FAEDE4]">
                  {suite.description}
                </p>
              </div>

              {/* Ingredients & Attributes */}
              <div>
                <h4 className="font-serif text-sm font-bold text-[#3A2218] mb-2 uppercase tracking-wide">Key Ingredients & Attributes</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-[#6E4E3F]">
                  {suite.amenities && suite.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-[#FFFDFC] p-2.5 rounded-xl border border-[#FAEDE4] select-none">
                      <span className="text-[#FF7A85]">✨</span>
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Subsystem */}
              <div className="border-t border-[#F5EDE8] pt-6 flex flex-col gap-4">
                <h4 className="font-serif text-base font-bold text-[#3A2218]">Customer Reviews ({suiteReviews.length})</h4>

                {/* Submissions form */}
                <form onSubmit={handleReviewSubmit} className="bg-[#FFFDFC] border border-[#FAEDE4] p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4B3023]">Leave a star-rating feedback:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setRating(st)}
                          className="hover:scale-110 transition cursor-pointer"
                        >
                          <Star size={15} className={st <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Comment on spices, fresh sugars or safe packaging..."
                      className="flex-grow bg-[#FDF8F5] px-3.5 py-2 text-xs rounded-xl border border-[#FAEDE4] outline-none placeholder-gray-400 focus:border-[#FF7A85] focus:bg-white text-[#3A2218]"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#FF7A85] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#C45543] transition cursor-pointer"
                    >
                      Post
                    </button>
                  </div>
                  {revSuccess && (
                     <p className="text-[10px] font-bold text-[#E36D5B]">⭐ Thank you! Your review has been added and average rating is recalculated.</p>
                  )}
                </form>

                {/* Feed comments */}
                <div className="max-h-60 overflow-y-auto flex flex-col gap-2.5 pr-2">
                  {suiteReviews.length === 0 ? (
                    <p className="text-xs italic text-gray-400 text-center py-4">No reviews yet for this recipe. Be the first to try it out!</p>
                  ) : (
                    suiteReviews.map(r => (
                      <div key={r.id} className="p-3 bg-[#FFFDFC] rounded-xl border border-[#F3ECE6]">
                        <div className="flex items-center gap-2">
                          <img src={r.avatar} alt={r.userName} className="h-7 w-7 rounded-full object-cover border border-[#FFF0EA]" />
                          <div>
                            <p className="text-xs font-bold text-[#3A2218]">{r.userName}</p>
                            <span className="text-[9px] text-gray-400">{r.date}</span>
                          </div>
                          <div className="flex items-center gap-0.5 ml-auto">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={9} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#6E5950] mt-2 leading-tight pl-0.5">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Col: Checkout purchase box & payment */}
            <div className="lg:col-span-5">
              <div className="bg-[#FFFDFC] border border-[#FAEDE4] rounded-3xl p-5 md:p-6 shadow-xs flex flex-col gap-4 sticky top-4">
                
                <div className="pb-3 border-b border-[#F7EFE9] flex items-baseline justify-between select-none">
                  <div>
                    <h3 className="font-serif text-base font-black text-[#3A2218]">Dynamic Order Panel</h3>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#A68F85] mt-0.5">Fresh Artisan Dispatch</p>
                  </div>
                  <div className="text-right">
                    <span className="font-sans font-black text-lg text-[#FF7A85]">${suite.pricePerNight}</span>
                    <span className="text-[10px] text-[#A68F85] font-semibold"> / {suite.unitWeight || 'box'}</span>
                  </div>
                </div>

                {paySuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 px-4 text-center bg-[#EAF2EA] rounded-2xl border border-[#BCD4BC] flex flex-col items-center gap-3"
                  >
                    <div className="h-10 w-10 text-white bg-[#8FBC8F] rounded-full flex items-center justify-center font-bold font-mono text-base">✓</div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#2A4D2A]">Sweet Order Dispatched!</h4>
                      <p className="text-[11px] text-[#4A6E4A] mt-1 leading-snug">
                        Successfully paid! Your order for {quantity}x boxes of "{suite.title}" is registered into cooking queues. View status triggers in your active dashboard.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-2 bg-[#3A2218] text-white text-xs font-black px-5 py-2 rounded-xl hover:bg-black cursor-pointer transition"
                    >
                      Back to Gallery
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                    
                    {/* Quantity selectors */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#8A756D] mb-1.5 flex items-center justify-between">
                        <span>Quantity (Packs / Tins)</span>
                        <span className="text-[#FF7A85] font-extrabold">{quantity} Pack{quantity > 1 ? 's' : ''}</span>
                      </label>
                      <div className="flex items-center gap-3 bg-[#FDF8F5] p-1.5 rounded-xl border border-[#FAEDE4]">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-8 w-8 rounded-lg bg-white border border-[#FAEDE4] text-xs font-bold text-[#3A2218] hover:bg-[#F5EDE8] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="flex-grow text-center text-xs font-extrabold text-[#3A2218]">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(suite.capacity, quantity + 1))}
                          className="h-8 w-8 rounded-lg bg-white border border-[#FAEDE4] text-xs font-bold text-[#3A2218] hover:bg-[#F5EDE8] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delivery Date Target */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#8A756D] mb-1.5 flex items-center gap-1">
                        <Calendar size={11} className="text-[#FF7A85]" /> Targeted Delivery Date
                      </label>
                      <input
                        type="date"
                        required
                        value={deliveryDate}
                        onChange={e => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-[#FDF8F5] p-2.5 rounded-xl border border-[#FAEDE4] text-xs font-semibold text-[#3A2218] outline-none focus:border-[#FF7A85] focus:bg-white"
                      />
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#8A756D] mb-1.5 flex items-center gap-1">
                        <MapPin size={11} className="text-[#FF7A85]" /> Shipping Home Address
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. 42 Jubilee Hills, Lane 2, Hyderabad"
                        className="w-full bg-[#FDF8F5] p-2.5 rounded-xl border border-[#FAEDE4] text-xs font-semibold text-[#3A2218] placeholder-gray-400 outline-none focus:border-[#FF7A85] focus:bg-white"
                      />
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#8A756D] mb-1.5 flex items-center gap-1">
                        <Phone size={11} className="text-[#FF7A85]" /> Buyer Phone Coordinates
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryPhone}
                        onChange={e => setDeliveryPhone(e.target.value)}
                        placeholder="e.g. +91 94455-66778"
                        className="w-full bg-[#FDF8F5] p-2.5 rounded-xl border border-[#FAEDE4] text-xs font-semibold text-[#3A2218] placeholder-gray-400 outline-none focus:border-[#FF7A85] focus:bg-white"
                      />
                    </div>

                    {/* Receipts calculator */}
                    <div className="bg-[#FFFDFC] p-3 rounded-2xl border border-[#FAEDE4] flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between text-[#8A756D] font-semibold">
                        <span>Items Price: ${suite.pricePerNight} x {quantity}</span>
                        <span className="font-mono text-[#3A2218] font-bold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#8A756D] font-semibold">
                        <span>Fresh Packing & Delivery</span>
                        <span className="font-mono text-[#3A2218] font-bold">${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#8A756D] font-semibold">
                        <span>Local State Food Cess (5%)</span>
                        <span className="font-mono text-[#3A2218] font-bold">${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-[#F7EFE9] my-1" />
                      <div className="flex justify-between text-[13px] font-bold text-[#3A2218]">
                        <span>Grand Total Payable</span>
                        <span className="font-mono text-[#E36D5B] font-extrabold">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Gateways Swapper */}
                    <div className="bg-[#FAF6F4] border border-[#FAEDE4] p-3 rounded-2xl flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-[#8A756D]">Payment Method Choice</label>
                      <div className="grid grid-cols-2 gap-2 bg-white/70 p-1 rounded-xl border border-[#FAEDE4]">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'bg-gradient-to-r from-[#FF7A85] to-[#FF9B85] text-white shadow-xs'
                              : 'text-[#8A756D] hover:text-[#3A2218]'
                          }`}
                        >
                          Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${
                            paymentMethod === 'wallet'
                              ? 'bg-gradient-to-r from-[#FF7A85] to-[#FF9B85] text-white shadow-xs'
                              : 'text-[#8A756D] hover:text-[#3A2218]'
                          }`}
                        >
                          Ghee Wallet
                        </button>
                      </div>

                      {paymentMethod === 'card' ? (
                        /* Beautiful Debit Card visual inputs */
                        <div className="flex flex-col gap-2 mt-1 select-none font-medium">
                          <div className="mb-1 text-[10px] text-gray-500 font-semibold tracking-wide">Enter Debit or Credit Credentials:</div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-[#A68F85] uppercase">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={e => setCardNumber(e.target.value)}
                              className="w-full bg-white px-2.5 py-1.5 text-xs font-mono rounded-lg border border-gray-200 outline-none text-[#3A2218] focus:border-[#FF7A85]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A68F85] uppercase">MM/YY</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={e => setCardExpiry(e.target.value)}
                                className="bg-white px-2.5 py-1.5 text-xs font-mono rounded-lg border border-gray-200 outline-none text-[#3A2218] focus:border-[#FF7A85]"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-[#A68F85] uppercase">CVV Pin</label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={e => setCardCvv(e.target.value)}
                                maxLength={3}
                                className="bg-white px-2.5 py-1.5 text-xs font-mono rounded-lg border border-gray-200 outline-none text-[#3A2218] focus:border-[#FF7A85]"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Wallet brief */
                        <div className="mt-1 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-[11px] text-[#346634] font-semibold flex flex-col gap-0.5">
                          <div className="flex justify-between">
                            <span>Balance Available:</span>
                            <span>${(currentUser.walletBalance ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-emerald-200/40 pt-1.5 mt-1 font-bold text-[#E36D5B] text-xs">
                            <span>Remaining balance:</span>
                            <span>${((currentUser.walletBalance ?? 0) - totalAmount).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {payError && (
                      <div className="text-[11px] font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                        ⚠️ {payError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPaying || !deliveryDate}
                      className="w-full text-xs font-black uppercase py-3 rounded-xl bg-gradient-to-r from-[#FF7A85] to-[#FF9B85] text-white hover:opacity-90 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isPaying ? 'Authorizing Sweet Payment...' : `Authorize Billing $${totalAmount.toFixed(2)}`}
                    </button>

                    <p className="text-[9px] text-gray-400 text-center flex items-center justify-center gap-1 font-semibold">
                      <ShieldCheck size={11} className="text-[#8FBC8F]" /> Safe Sandbox SSL billing active.
                    </p>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

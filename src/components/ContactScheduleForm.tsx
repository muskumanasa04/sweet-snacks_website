import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Phone, Mail, User } from 'lucide-react';
import { motion } from 'motion/react';

export const ContactScheduleForm: React.FC = () => {
  const { addContactSchedule, currentUser } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [topic, setTopic] = useState('Viewing Inquiry');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const SLOTS = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !date || !message.trim()) return;

    addContactSchedule({
      name,
      email,
      phone,
      date,
      timeSlot,
      topic,
      message
    });

    setMessage('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="bg-white border border-[#FAF1EB] rounded-3xl p-5 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-stretch select-none">
      
      {/* Left decorative segment */}
      <div className="md:w-1/3 bg-gradient-to-tr from-[#FFF4F1] to-[#FFF9F6] border border-[#FFD9CE] rounded-2xl p-5 md:p-6 text-left flex flex-col justify-between">
        <div>
          <span className="text-[10px] bg-[#FFF2EE] text-[#FF7A85] border border-[#FFE1D9] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Appointment Desk
          </span>
          <h3 className="font-serif text-xl font-bold text-[#3A2218] mt-3 tracking-tight">Arrange a Physical Suite walkthrough</h3>
          <p className="text-xs text-[#8A756D] mt-2 leading-relaxed">
            Want to visually inspect the Sugar Plum Manor or discuss custom partnership ventures with the administrative board?
          </p>
          <p className="text-xs text-[#8A756D] mt-2 leading-relaxed">
            Pick a date and timeslot. We will locked in your spot and notify admins instantly in real-time.
          </p>
        </div>

        <div className="border-t border-[#FFD9CE] pt-4 mt-6 text-xs text-[#6E4E3F] leading-none flex flex-col gap-2">
          <p className="font-bold flex items-center gap-1.5">🧁 Specialty Consults</p>
          <p className="font-bold flex items-center gap-1.5">🔑 Owner Onboarding support</p>
          <p className="font-bold flex items-center gap-1.5">🎟️ Special Event Walkthroughs</p>
        </div>
      </div>

      {/* Form right column */}
      <form onSubmit={handleSubmit} className="md:w-2/3 flex flex-col gap-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
              <User size={11} className="text-[#FF9B85]" /> Your Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Amelia Rose"
              className="w-full bg-[#FFFDFC] px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#FF7A85]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
              <Mail size={11} className="text-[#FF9B85]" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="amelia@sweetstay.com"
              className="w-full bg-[#FFFDFC] px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#FF7A85]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
              <Phone size={11} className="text-[#FF9B85]" /> Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#FFFDFC] px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#FF7A85] font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Select Consultation Topic</label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-[#FFFDFC] px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#FF7A85]"
            >
              <option value="Viewing Inquiry">Physical Suite Walkthrough Inquiry</option>
              <option value="Partnership">Vendor / Partnership Proposal</option>
              <option value="Event Booking">Event compound reservation support</option>
              <option value="Other">Other general Sweet inquiries</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center gap-1">
              <Calendar size={11} className="text-[#FF9B85]" /> Pick A Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-[#FFFDFC] px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#FF7A85] font-bold text-[#3A2218]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pick Timeslot</label>
            <select
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              className="w-full bg-[#FFFDFC] px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#FF7A85]"
            >
              {SLOTS.map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Details & Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Share details about what accommodations you're interested in scheduling or partnership terms..."
            className="w-full bg-[#FFFDFC] px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#FF7A85] h-20 resize-none whitespace-normal"
            required
          />
        </div>

        {success && (
          <p className="text-xs font-bold text-center text-[#E36D5B]">🎉 Booking requested! Your scheduled slot is locked in. Active updates will display in your user panel.</p>
        )}

        <button
          type="submit"
          className="mt-2 bg-[#FF7A85] hover:bg-[#C45543] text-white text-xs font-bold tracking-widest uppercase py-3 rounded-xl cursor-pointer shadow-md shadow-[#FF9B85]/20 transition duration-200"
        >
          Confirm Consultation Appointment
        </button>
      </form>
    </div>
  );
};

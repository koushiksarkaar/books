import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Heart, Sparkles } from 'lucide-react';

export const Banner: React.FC = () => {
  const { theme } = useApp();
  const [closed, setClosed] = useState(false);
  const [showDonateMsg, setShowDonateMsg] = useState(false);

  if (closed || !theme.bannerVisible) return null;

  const displayBannerText = theme.bannerText && theme.bannerText.includes('Support our mission')
    ? 'Welcome to Books Library! Read and download free interactive books.'
    : theme.bannerText;

  return (
    <>
      <div 
        id="top-promo-banner" 
        className="bg-emerald-600 text-white text-xs py-2 px-4 flex items-center justify-between transition-all duration-300 relative z-30 font-sans shadow-sm"
      >
        <div className="flex-1 flex justify-center items-center gap-2">
          <Heart id="logo-heart-banner" className="w-3.5 h-3.5 fill-rose-300 stroke-none animate-pulse" />
          <span className="font-semibold tracking-wide text-center sm:text-left">
            {displayBannerText}
          </span>
          <button
            id="donate-now-btn"
            onClick={() => setShowDonateMsg(true)}
            className="ml-3 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-full text-[10px] uppercase tracking-wider transition-all duration-200 shadow-sm transform hover:scale-105"
          >
            {theme.bannerButtonText}
          </button>
        </div>
        <button
          id="close-banner-btn"
          onClick={() => setClosed(true)}
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showDonateMsg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Support Free Literature</h3>
            <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">
              Thank you for clicking! In a live production deploy containing a payment getaway, this popup connects to PayPal, Stripe, or a recurring micro-donation engine. Our fully customizable layout is ready to adapt to your preferred provider in just a few clicks!
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  alert('Thank you for simulating a generous donation! This triggers payment API simulation.');
                  setShowDonateMsg(false);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md focus:ring-2 focus:ring-emerald-500/50"
              >
                Mock $5 Donation
              </button>
              <button
                onClick={() => setShowDonateMsg(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

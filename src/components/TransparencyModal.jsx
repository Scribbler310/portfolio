import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, DollarSign, Shield } from 'lucide-react';

export default function TransparencyModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gs-navy/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gs-navy p-6 flex justify-between items-start text-white">
            <div>
              <span className="text-gs-gold text-xs font-semibold uppercase tracking-wider mb-2 block">Recommendation</span>
              <h2 className="text-2xl font-light">{data.title}</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {/* The Advice */}
            <div className="bg-gs-light p-5 rounded-xl border-l-4 border-gs-gold">
              <h3 className="font-medium text-gs-navy mb-1 flex items-center">
                <Info size={18} className="mr-2 text-gs-gold" /> The Action Plan
              </h3>
              <p className="text-gs-slate font-light text-lg">
                {data.advice}
              </p>
            </div>

            {/* The Why */}
            <div>
              <h3 className="font-medium text-gs-navy mb-2 flex items-center">
                <Shield size={18} className="mr-2 text-gs-slate" /> Why we recommend this
              </h3>
              <p className="text-gs-slate font-light text-sm leading-relaxed">
                {data.explanation}
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* Radical Transparency Section */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gs-slate font-semibold mb-4">
                Full Transparency
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white">
                  <span className="text-sm text-gs-slate font-light flex items-center">
                    <DollarSign size={14} className="mr-2 text-gray-400" /> Fee Impact
                  </span>
                  <span className="font-medium text-gs-navy text-sm">{data.feeImpactDollars}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-white">
                  <span className="text-sm text-gs-slate font-light flex items-center">
                    <Shield size={14} className="mr-2 text-gray-400" /> Tax Considerations
                  </span>
                  <span className="font-medium text-gs-navy text-sm">{data.taxImpact}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full mt-4 bg-gs-navy text-white py-4 rounded-xl font-medium hover:bg-gs-navy/90 transition-colors shadow-md"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

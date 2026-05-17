'use client';

import { motion } from 'framer-motion';
import { HOW_IT_WORKS } from '@/lib/data';

export function HowItWorks() {
  return (
    <section className="section bg-gray-950 text-white overflow-hidden">
      <div className="container-main">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-3"
          >
            Simple Process
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-black leading-tight"
          >
            Simple, Secure, Local
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-3 text-lg max-w-md mx-auto"
          >
            Find what you need in four easy steps. We handle the logistics and safety.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center p-6"
            >
              {/* Step circle */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl border border-blue-500/30 backdrop-blur-sm">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-black">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

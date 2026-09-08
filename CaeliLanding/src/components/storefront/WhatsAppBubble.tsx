import React from 'react';
import { motion } from 'framer-motion';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { whatsappLink } from '../../utils/whatsapp';

export function WhatsAppBubble() {
  return (
    <motion.a
      href={whatsappLink('¡Hola Caeli! Tengo una consulta sobre una pieza que estoy viendo.')}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-bubble"
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
      className="group fixed bottom-5 right-5 z-30 flex items-center gap-0 rounded-full bg-whatsapp py-3.5 pl-4 pr-4 text-white shadow-float transition-all duration-500 ease-soft hover:bg-whatsapp-deep hover:shadow-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory sm:bottom-8 sm:right-8"
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-medium opacity-0 transition-[max-width,opacity,margin] duration-200 ease-soft group-hover:ml-2 group-hover:max-w-[12rem] group-hover:opacity-100">
        ¡Escribinos!
      </span>
      <span className="sr-only">Consultá con Caeli por WhatsApp</span>
    </motion.a>
  );
}
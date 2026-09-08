import React from 'react';
import { motion } from 'framer-motion';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { whatsappLink } from '../../utils/whatsapp';

export function WhatsAppBubble() {
  return (
    <motion.a
      href={whatsappLink("Hi Caeli! I have a question about a piece I'm looking at.")}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
      className="group fixed bottom-5 right-5 z-30 flex items-center gap-0 rounded-full bg-whatsapp py-3 pl-4 pr-4 text-white shadow-float transition-colors duration-150 ease-soft hover:bg-whatsapp-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory sm:bottom-8 sm:right-8">
      
      <WhatsAppIcon className="h-6 w-6 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-medium opacity-0 transition-[max-width,opacity,margin] duration-200 ease-soft group-hover:ml-2 group-hover:max-w-[10rem] group-hover:opacity-100">
        Chat with us
      </span>
      <span className="sr-only">Chat with Caeli on WhatsApp</span>
    </motion.a>);

}
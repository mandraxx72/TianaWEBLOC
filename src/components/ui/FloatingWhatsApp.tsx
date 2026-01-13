import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FloatingWhatsApp = () => {
  const { t } = useLanguage();
  const whatsappNumber = "+2385937127";

  const handleClick = () => {
    const message = encodeURIComponent(t('whatsapp.floating.message'));
    window.open(
      `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`,
      '_blank'
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 md:w-14 md:h-14 
                     bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-full 
                     shadow-lg hover:shadow-xl flex items-center justify-center 
                     transition-all duration-300 hover:scale-110 
                     animate-[pulse_3s_ease-in-out_infinite]"
          aria-label="Contact via WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-background text-foreground">
        {t('whatsapp.floating.tooltip')}
      </TooltipContent>
    </Tooltip>
  );
};

export default FloatingWhatsApp;

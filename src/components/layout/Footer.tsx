
import { MapPin, Phone, Mail, Instagram, Facebook, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PaymentMethodsLogos } from "@/components/ui/PaymentMethodsLogos";

interface FooterProps {
  siteName?: string;
  contactInfo?: {
    address?: string[];
    phone?: string[];
    email?: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tripadvisor?: string;
  };
  awards?: string[];
}

const Footer = ({
  siteName = "Casa Tiana",
  contactInfo = {
    address: ["Alto São Nicolau", "Mindelo - S.Vicente"],
    phone: ["+2385937127"],
    email: "casatiana@gmail.com"
  },
  socialLinks = {},
  awards = [
    "🏆 TripAdvisor Travellers' Choice 2023",
    "🌿 Certificado Sustentabilidade",
    "⭐ Booking.com Guest Review Award"
  ]
}: FooterProps) => {
  const { t } = useLanguage();

  const quickLinks = [
    { href: "#sobre", label: t('nav.about') },
    { href: "#quartos", label: t('nav.rooms') },
    { href: "#galeria", label: t('nav.gallery') },
    { href: "#avaliacoes", label: t('nav.reviews') },
    { href: "#blog", label: t('nav.blog') },
    { href: "#contato", label: t('nav.contact') }
  ];

  const languages = ["Português", "English", "Français"];

  return (
    <footer className="bg-earth-brown text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-bold mb-4 font-playfair bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent">
                {siteName}
              </h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                {t('footer.description')}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-primary" />
                  <Star className="h-4 w-4 fill-current text-primary" />
                  <Star className="h-4 w-4 fill-current text-primary" />
                  <Star className="h-4 w-4 fill-current text-primary" />
                  <Star className="h-4 w-4 fill-current text-primary" />
                </div>
                <span className="text-sm text-white/80">4.9/5 (150+ {t('footer.reviews')})</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6 font-playfair">{t('footer.quickLinks')}</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/80 hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-semibold mb-6 font-playfair">{t('footer.contact')}</h4>
              <div className="space-y-4">
                {contactInfo.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="text-white/80">
                      {contactInfo.address.map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}

                {contactInfo.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="text-white/80">
                      {contactInfo.phone.map((phone, index) => (
                        <p key={index}>{phone}</p>
                      ))}
                    </div>
                  </div>
                )}

                {contactInfo.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="text-white/80">
                      <p>{contactInfo.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media & Additional Info */}
          <div className="border-t border-white/20 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
              {/* Social Media */}
              <div>
                <h5 className="font-semibold mb-4">{t('footer.followUs')}</h5>
                <div className="flex space-x-4">
                  <a
                    href={socialLinks.instagram || "#"}
                    className="bg-white/10 hover:bg-primary transition-colors duration-300 p-3 rounded-full"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={socialLinks.facebook || "#"}
                    className="bg-white/10 hover:bg-primary transition-colors duration-300 p-3 rounded-full"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={socialLinks.tripadvisor || "#"}
                    className="bg-white/10 hover:bg-primary transition-colors duration-300 p-3 rounded-full"
                  >
                    <Star className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Languages */}
              <div className="text-center">
                <h5 className="font-semibold mb-4">{t('footer.languages')}</h5>
                <div className="flex justify-center space-x-4 text-sm">
                  {languages.map((lang) => (
                    <span key={lang} className="px-3 py-1 bg-white/10 rounded-full">{lang}</span>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="text-center">
                <h5 className="font-semibold mb-4">Meios de Pagamento</h5>
                <PaymentMethodsLogos size="sm" showLabel={false} className="justify-center" />
              </div>

              {/* Awards */}
              <div className="text-center md:text-right">
                <h5 className="font-semibold mb-4">{t('footer.awards')}</h5>
                <div className="text-sm text-white/80">
                  {awards.map((award, index) => (
                    <p key={index}>{award}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p>&copy; 2023 {siteName}. {t('footer.copyright')}</p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="hover:text-primary transition-colors">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('footer.terms')}
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  {t('footer.cancellation')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

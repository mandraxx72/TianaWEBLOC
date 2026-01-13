import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import Map from "./Map";

import WeatherWidget from "./WeatherWidget";

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const whatsappNumber = "+2385937127";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleWhatsAppClick = (messageKey: string) => {
    const message = encodeURIComponent(t(messageKey));
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.errorRequired');
    } else if (formData.name.length > 100) {
      newErrors.name = t('contact.form.errorMaxLength');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.errorRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.errorInvalidEmail');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.errorRequired');
    } else if (formData.message.length > 1000) {
      newErrors.message = t('contact.form.errorMaxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: t('contact.form.errorTitle'),
        description: t('contact.form.errorDescription'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission (in production, this would send to an API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: t('contact.form.successTitle'),
        description: t('contact.form.successDescription'),
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setErrors({});
    } catch (error) {
      toast({
        title: t('contact.form.errorTitle'),
        description: t('contact.form.errorSubmit'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <section id="contato" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent mb-6 font-playfair">
              {t('contact.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form & Weather Widget */}
            <div className="space-y-8 animate-fade-in">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 font-playfair">
                    {t('contact.form.title')}
                  </h3>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.form.name')} <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder={t('contact.form.namePlaceholder')}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={errors.name ? "border-destructive" : ""}
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.form.email')} <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder={t('contact.form.emailPlaceholder')}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={errors.email ? "border-destructive" : ""}
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.form.phone')}
                        </label>
                        <Input
                          type="tel"
                          placeholder={t('contact.form.phonePlaceholder')}
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.form.subject')}
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="">{t('contact.form.subjectPlaceholder')}</option>
                          <option value="reserva">{t('contact.form.subjectReservation')}</option>
                          <option value="informacoes">{t('contact.form.subjectInfo')}</option>
                          <option value="eventos">{t('contact.form.subjectEvents')}</option>
                          <option value="sugestoes">{t('contact.form.subjectSuggestions')}</option>
                          <option value="outros">{t('contact.form.subjectOther')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('contact.form.message')} <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        placeholder={t('contact.form.messagePlaceholder')}
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className={errors.message ? "border-destructive" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive mt-1">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-gold-start to-gold-end hover:opacity-95 shadow-md border-none text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('contact.form.submitting')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t('contact.form.submit')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <WeatherWidget />
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-8 animate-fade-in">
              {/* Contact Information */}
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 font-playfair">
                    {t('contact.info.title')}
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.info.address')}</h4>
                        <p className="text-muted-foreground">
                          Alto São Nicolau<br />
                          Mindelo - S.Vicente
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.info.phone')}</h4>
                        <p className="text-muted-foreground">
                          +2385937127
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.info.email')}</h4>
                        <p className="text-muted-foreground">
                          casatiana@gmail.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('contact.info.hours')}</h4>
                        <p className="text-muted-foreground">
                          {t('contact.info.hoursWeekday')}<br />
                          {t('contact.info.hoursWeekend')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <Button
                      onClick={() => handleWhatsAppClick('contact.whatsapp.message')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t('contact.whatsapp')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Map */}
              <Card>
                <CardContent className="p-0">
                  <Map />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Contact Options */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold mb-8 font-playfair">
              {t('contact.quickHelp')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('contact.urgent.title')}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('contact.urgent.desc')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsAppClick('contact.whatsapp.message')}
                  >
                    {t('contact.urgent.button')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('contact.support.title')}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('contact.support.desc')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsAppClick('contact.whatsapp.message')}
                  >
                    {t('contact.support.button')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('contact.events.title')}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('contact.events.desc')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsAppClick('contact.whatsapp.message')}
                  >
                    {t('contact.events.button')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

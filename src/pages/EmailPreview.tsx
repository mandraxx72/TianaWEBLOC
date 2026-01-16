import React, { useState } from 'react';

type Language = 'pt' | 'en' | 'fr';

const translations = {
    pt: {
        badge: 'Reserva Pendente',
        greeting: 'Olá, {name}! 🌴',
        resNumberLabel: 'Número da Reserva:',
        checkIn: 'Check-in:',
        checkOut: 'Check-out:',
        guestsLabel: 'Hóspedes:',
        guestsDetail: '{adults} Adultos, {children} Criança',
        totalLabel: 'Preço Total (Incl. Taxas)',
        breakfast: 'Café da Manhã Incluído',
        wifi: 'Wi-Fi de Alta Velocidade',
        cleaning: 'Limpeza Diária',
        parking: 'Estacionamento Gratuito',
        whatsapp: 'Fale Conosco no WhatsApp',
        footerName: 'Casa Tiana Boutique Guesthouse',
        footerAddress: 'Mindelo, São Vicente, Cabo Verde',
        footerPhone: 'Tel: +238 123 456 789',
        footerEmail: 'Email: info@casatiana.cv',
        terms: 'Termos e Condições',
        privacy: 'Política de Privacidade',
        unsubscribe: 'Cancelar Inscrição',
    },
    en: {
        badge: 'Reservation Pending',
        greeting: 'Hello, {name}! 🌴',
        resNumberLabel: 'Reservation Number:',
        checkIn: 'Check-in:',
        checkOut: 'Check-out:',
        guestsLabel: 'Guests:',
        guestsDetail: '{adults} Adults, {children} Child',
        totalLabel: 'Total Price (Incl. Taxes)',
        breakfast: 'Breakfast Included',
        wifi: 'High Speed Wi-Fi',
        cleaning: 'Daily Cleaning',
        parking: 'Free Parking',
        whatsapp: 'Contact us on WhatsApp',
        footerName: 'Casa Tiana Boutique Guesthouse',
        footerAddress: 'Mindelo, São Vicente, Cabo Verde',
        footerPhone: 'Tel: +238 123 456 789',
        footerEmail: 'Email: info@casatiana.cv',
        terms: 'Terms & Conditions',
        privacy: 'Privacy Policy',
        unsubscribe: 'Unsubscribe',
    },
    fr: {
        badge: 'Réservation en Attente',
        greeting: 'Bonjour, {name}! 🌴',
        resNumberLabel: 'Numéro de Réservation:',
        checkIn: 'Arrivée:',
        checkOut: 'Départ:',
        guestsLabel: 'Voyageurs:',
        guestsDetail: '{adults} Adultes, {children} Enfant',
        totalLabel: 'Prix Total (Taxes incl.)',
        breakfast: 'Petit-déjeuner Inclus',
        wifi: 'Wi-Fi Haut Débit',
        cleaning: 'Ménage Quotidien',
        parking: 'Parking Gratuit',
        whatsapp: 'Contactez-nous sur WhatsApp',
        footerName: 'Casa Tiana Boutique Guesthouse',
        footerAddress: 'Mindelo, São Vicente, Cabo Verde',
        footerPhone: 'Tél: +238 123 456 789',
        footerEmail: 'Email: info@casatiana.cv',
        terms: 'Conditions Générales',
        privacy: 'Politique de Confidentialité',
        unsubscribe: 'Se Désinscrire',
    }
};

// SVG Icons matching the screenshot
const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const GuestsIcon = () => (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#8B7355" strokeWidth="1.5">
        <circle cx="24" cy="12" r="6" />
        <circle cx="10" cy="16" r="4" />
        <circle cx="38" cy="16" r="4" />
        <path d="M24 22c-6 0-10 4-10 10v4h20v-4c0-6-4-10-10-10z" />
        <path d="M10 24c-4 0-6 3-6 7v3h8" />
        <path d="M38 24c4 0 6 3 6 7v3h-8" />
    </svg>
);

const BreakfastIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8B7355" strokeWidth="1.2">
        <ellipse cx="16" cy="20" rx="10" ry="6" />
        <path d="M6 20v4c0 3.3 4.5 6 10 6s10-2.7 10-6v-4" />
        <path d="M10 8c0-2 1-4 3-4s3 2 3 4" />
        <path d="M16 8c0-2 1-4 3-4s3 2 3 4" />
        <circle cx="26" cy="18" r="3" />
        <line x1="26" y1="21" x2="26" y2="26" />
    </svg>
);

const WifiIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8B7355" strokeWidth="1.5">
        <path d="M5 12c6-6 16-6 22 0" />
        <path d="M9 16c4-4 10-4 14 0" />
        <path d="M13 20c2-2 4-2 6 0" />
        <circle cx="16" cy="24" r="2" fill="#8B7355" />
    </svg>
);

const CleaningIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8B7355" strokeWidth="1.2">
        <path d="M10 28l2-16h8l2 16" />
        <path d="M8 12h16" />
        <path d="M14 12V8l-2-4h8l-2 4v4" />
        <line x1="14" y1="16" x2="14" y2="24" />
        <line x1="18" y1="16" x2="18" y2="24" />
    </svg>
);

const ParkingIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8B7355" strokeWidth="1.2">
        <rect x="4" y="6" width="24" height="20" rx="2" />
        <path d="M12 10v12" />
        <path d="M12 10h6c2 0 4 2 4 4s-2 4-4 4h-6" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

interface EmailTemplateProps {
    guestName: string;
    reservationNumber: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    totalPrice: string;
    language: Language;
    isPending?: boolean;
}

const EmailTemplate = ({
    guestName,
    reservationNumber,
    checkIn,
    checkOut,
    adults,
    children,
    totalPrice,
    language,
    isPending = true,
}: EmailTemplateProps) => {
    const t = translations[language];

    return (
        <div style={emailContainer}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={headerContent}>
                    <div>
                        <div style={logoText}>Casa Tiana</div>
                        <div style={subtitleText}>Boutique Guesthouse</div>
                    </div>
                    <div style={locationBadge}>
                        <LocationIcon />
                        <div style={locationText}>
                            <div>Mindelo,</div>
                            <div>São Vicente</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div style={badgeContainer}>
                <div style={isPending ? pendingBadgeStyle : confirmedBadgeStyle}>
                    <span style={{ marginRight: '8px' }}>✓</span>
                    {isPending ? t.badge : 'Reserva Confirmada'}
                </div>
            </div>

            {/* Content */}
            <div style={contentStyle}>
                {/* Greeting */}
                <h1 style={greetingStyle}>
                    {t.greeting.replace('{name}', guestName)}
                </h1>

                {/* Reservation Number */}
                <div style={resNumberBoxStyle}>
                    <div style={resNumberLabelStyle}>{t.resNumberLabel}</div>
                    <div style={resNumberValueStyle}>#{reservationNumber}</div>
                </div>

                {/* Details Grid */}
                <div style={detailsGridStyle}>
                    {/* Dates Column */}
                    <div style={datesColumnStyle}>
                        <div style={dateCardStyle}>
                            <CalendarIcon />
                            <div style={dateTextContainer}>
                                <div style={dateLabelStyle}>{t.checkIn}</div>
                                <div style={dateValueStyle}>{checkIn}</div>
                            </div>
                        </div>
                        <div style={{ ...dateCardStyle, marginTop: '8px' }}>
                            <CalendarIcon />
                            <div style={dateTextContainer}>
                                <div style={dateLabelStyle}>{t.checkOut}</div>
                                <div style={dateValueStyle}>{checkOut}</div>
                            </div>
                        </div>
                    </div>

                    {/* Guests Column */}
                    <div style={guestsColumnStyle}>
                        <GuestsIcon />
                        <div style={guestsLabelStyle}>{t.guestsLabel}</div>
                        <div style={guestsDetailStyle}>
                            {t.guestsDetail
                                .replace('{adults}', adults.toString())
                                .replace('{children}', children.toString())}
                        </div>
                    </div>

                    {/* Price Column */}
                    <div style={priceColumnStyle}>
                        <div style={priceValueStyle}>{totalPrice}</div>
                        <div style={priceLabelStyle}>{t.totalLabel}</div>
                    </div>
                </div>

                {/* Amenities */}
                <div style={amenitiesGridStyle}>
                    <div style={amenityCardStyle}>
                        <BreakfastIcon />
                        <div style={amenityTextStyle}>{t.breakfast}</div>
                    </div>
                    <div style={amenityCardStyle}>
                        <WifiIcon />
                        <div style={amenityTextStyle}>{t.wifi}</div>
                    </div>
                    <div style={amenityCardStyle}>
                        <CleaningIcon />
                        <div style={amenityTextStyle}>{t.cleaning}</div>
                    </div>
                    <div style={amenityCardStyle}>
                        <ParkingIcon />
                        <div style={amenityTextStyle}>{t.parking}</div>
                    </div>
                </div>

                {/* WhatsApp Button */}
                <a href="https://wa.me/238123456789" style={whatsappButtonStyle}>
                    <WhatsAppIcon />
                    <span style={{ marginLeft: '8px' }}>{t.whatsapp}</span>
                </a>
            </div>

            {/* Footer */}
            <div style={footerStyle}>
                <div style={footerTextStyle}>{t.footerName}</div>
                <div style={footerSubtextStyle}>{t.footerAddress}</div>
                <div style={footerSubtextStyle}>{t.footerPhone}</div>
                <div style={footerSubtextStyle}>{t.footerEmail}</div>

                {/* Social Icons */}
                <div style={socialIconsStyle}>
                    <a href="#" style={socialIconStyle}>f</a>
                    <a href="#" style={socialIconStyle}>📷</a>
                    <a href="#" style={socialIconStyle}>K</a>
                </div>

                {/* Links */}
                <div style={footerLinksStyle}>
                    <a href="#" style={footerLinkStyle}>{t.terms}</a>
                    <span style={{ margin: '0 8px', color: '#666' }}>|</span>
                    <a href="#" style={footerLinkStyle}>{t.privacy}</a>
                    <span style={{ margin: '0 8px', color: '#666' }}>|</span>
                    <a href="#" style={footerLinkStyle}>{t.unsubscribe}</a>
                </div>
            </div>
        </div>
    );
};

// Styles
const emailContainer: React.CSSProperties = {
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
};

const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #8B7355 0%, #C4A77D 50%, #8B7355 100%)',
    padding: '30px 24px',
};

const headerContent: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const logoText: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
};

const subtitleText: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
    marginTop: '4px',
};

const locationBadge: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ffffff',
};

const locationText: React.CSSProperties = {
    textAlign: 'right' as const,
    fontSize: '13px',
    lineHeight: '1.3',
};

const badgeContainer: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '-16px',
};

const confirmedBadgeStyle: React.CSSProperties = {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    padding: '10px 24px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const pendingBadgeStyle: React.CSSProperties = {
    ...confirmedBadgeStyle,
    backgroundColor: '#f59e0b',
};

const contentStyle: React.CSSProperties = {
    padding: '30px 24px',
};

const greetingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 24px 0',
};

const resNumberBoxStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #8B7355 0%, #C4A77D 100%)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const resNumberLabelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    marginBottom: '4px',
};

const resNumberValueStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
};

const detailsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
};

const datesColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
};

const dateCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
};

const dateTextContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
};

const dateLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#6b7280',
};

const dateValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1a1a1a',
};

const guestsColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
};

const guestsLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
};

const guestsDetailStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center' as const,
};

const priceColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    border: '2px solid #C4A77D',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
};

const priceValueStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#8B7355',
};

const priceLabelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginTop: '4px',
};

const amenitiesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '24px',
};

const amenityCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 8px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
};

const amenityTextStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#4b5563',
    textAlign: 'center' as const,
    marginTop: '8px',
    fontWeight: '500',
};

const whatsappButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    color: '#ffffff',
    padding: '14px 24px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
};

const footerStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    padding: '30px 24px',
    textAlign: 'center' as const,
};

const footerTextStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
};

const footerSubtextStyle: React.CSSProperties = {
    color: '#9ca3af',
    fontSize: '12px',
    marginBottom: '4px',
};

const socialIconsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '16px',
    marginBottom: '16px',
};

const socialIconStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid #4b5563',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '14px',
};

const footerLinksStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '4px',
};

const footerLinkStyle: React.CSSProperties = {
    color: '#8B7355',
    fontSize: '11px',
    textDecoration: 'underline',
};


export default function EmailPreviewPage() {
    const [lang, setLang] = useState<Language>('pt');
    const [isPending, setIsPending] = useState(true);

    return (
        <div style={{ padding: '40px 20px', backgroundColor: '#e2e8f0', minHeight: '100vh' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '20px', textAlign: 'center', fontSize: '24px' }}>
                    Preview de Email
                </h1>

                {/* Status Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setIsPending(true)}
                        style={{
                            padding: '10px 20px',
                            fontWeight: isPending ? 'bold' : 'normal',
                            backgroundColor: isPending ? '#f59e0b' : '#ffffff',
                            color: isPending ? '#ffffff' : '#1a1a1a',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        ⏳ Pendente
                    </button>
                    <button
                        onClick={() => setIsPending(false)}
                        style={{
                            padding: '10px 20px',
                            fontWeight: !isPending ? 'bold' : 'normal',
                            backgroundColor: !isPending ? '#22c55e' : '#ffffff',
                            color: !isPending ? '#ffffff' : '#1a1a1a',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        ✓ Confirmada
                    </button>
                </div>

                {/* Language Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                    <button
                        onClick={() => setLang('pt')}
                        style={{
                            padding: '10px 20px',
                            fontWeight: lang === 'pt' ? 'bold' : 'normal',
                            backgroundColor: lang === 'pt' ? '#8B7355' : '#ffffff',
                            color: lang === 'pt' ? '#ffffff' : '#1a1a1a',
                            border: '1px solid #8B7355',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        PT
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            padding: '10px 20px',
                            fontWeight: lang === 'en' ? 'bold' : 'normal',
                            backgroundColor: lang === 'en' ? '#8B7355' : '#ffffff',
                            color: lang === 'en' ? '#ffffff' : '#1a1a1a',
                            border: '1px solid #8B7355',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLang('fr')}
                        style={{
                            padding: '10px 20px',
                            fontWeight: lang === 'fr' ? 'bold' : 'normal',
                            backgroundColor: lang === 'fr' ? '#8B7355' : '#ffffff',
                            color: lang === 'fr' ? '#ffffff' : '#1a1a1a',
                            border: '1px solid #8B7355',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        FR
                    </button>
                </div>

                <EmailTemplate
                    guestName="João"
                    reservationNumber="RES-CV2468"
                    checkIn="15 Nov 2023"
                    checkOut="20 Nov 2023"
                    adults={2}
                    children={1}
                    totalPrice="45.000 CVE"
                    language={lang}
                    isPending={isPending}
                />
            </div>
        </div>
    );
}

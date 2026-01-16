import * as React from 'npm:react@18.3.1';
import { Section, Text, Row, Column, Heading, Button, Hr, Img } from 'npm:@react-email/components@0.0.12';
import { Layout } from './components/Layout.tsx';

type Language = 'pt' | 'en' | 'fr';

interface PendingPaymentEmailProps {
    guestName: string;
    reservationNumber: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    totalPrice: number;
    specialRequests?: string;
    paymentLink: string;
    language?: Language;
}

const translations = {
    pt: {
        preview: 'Reserva Pendente',
        badge: 'Reserva Pendente',
        greeting: 'Olá, {name}! 🌴',
        success: 'A sua reserva foi registada com sucesso! Para confirmar definitivamente a sua estadia na Casa Tiana, por favor complete o pagamento.',
        resNumberLabel: 'Número da Reserva:',
        detailsTitle: 'Detalhes da Estadia',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        fromTime: 'A partir das 14:00',
        toTime: 'Até às 12:00',
        guestsLabel: 'Hóspedes:',
        guestsValue: '{count} {label}',
        guest: 'Adulto', // Simplified for generic guest count
        guests: 'Adultos', // Simplified
        totalLabel: 'Preço Total (Incl. Taxas)',
        payTitle: 'Complete o seu pagamento',
        payText: 'Clique no botão abaixo para concluir a reserva de forma segura.',
        payButton: 'Pagar Agora - {price}',
        secure: '🔒 Pagamento seguro processado por SISP',
        included: 'O que está incluído',
        breakfast: 'Café da Manhã Incluído',
        wifi: 'Wi-Fi de Alta Velocidade',
        cleaning: 'Limpeza Diária',
        parking: 'Estacionamento Gratuito',
        help: 'Tem alguma dúvida? Estamos aqui para ajudar!',
        whatsapp: '💬 Falar no WhatsApp',
        closing: 'Esperamos vê-lo em breve!',
        team: 'Equipa Casa Tiana',
        specialReq: 'Pedidos Especiais',
    },
    en: {
        preview: 'Reservation Pending',
        badge: 'Reservation Pending',
        greeting: 'Hello, {name}! 🌴',
        success: 'Your reservation has been successfully registered! To confirm your stay at Casa Tiana, please complete the payment.',
        resNumberLabel: 'Reservation Number:',
        detailsTitle: 'Stay Details',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        fromTime: 'From 14:00',
        toTime: 'Until 12:00',
        guestsLabel: 'Guests:',
        guestsValue: '{count} {label}',
        guest: 'Adult',
        guests: 'Adults',
        totalLabel: 'Total Price (Incl. Taxes)',
        payTitle: 'Complete your payment',
        payText: 'Click the button below to complete the reservation securely.',
        payButton: 'Pay Now - {price}',
        secure: '🔒 Secure payment processed by SISP',
        included: 'What is included',
        breakfast: 'Breakfast Included',
        wifi: 'High Speed Wi-Fi',
        cleaning: 'Daily Cleaning',
        parking: 'Free Parking',
        help: 'Have any questions? We are here to help!',
        whatsapp: '💬 Chat on WhatsApp',
        closing: 'We hope to see you soon!',
        team: 'Casa Tiana Team',
        specialReq: 'Special Requests',
    },
    fr: {
        preview: 'Réservation en Attente',
        badge: 'Réservation en Attente',
        greeting: 'Bonjour, {name}! 🌴',
        success: 'Votre réservation a été enregistrée avec succès ! Pour confirmer votre séjour à Casa Tiana, veuillez effectuer le paiement.',
        resNumberLabel: 'Numéro de Réservation :',
        detailsTitle: 'Détails du Séjour',
        checkIn: 'Arrivée',
        checkOut: 'Départ',
        fromTime: 'À partir de 14h00',
        toTime: 'Jusqu\'à 12h00',
        guestsLabel: 'Voyageurs :',
        guestsValue: '{count} {label}',
        guest: 'Adulte',
        guests: 'Adultes',
        totalLabel: 'Prix Total (Taxes incl.)',
        payTitle: 'Complétez votre paiement',
        payText: 'Cliquez sur le bouton ci-dessous pour finaliser la réservation en toute sécurité.',
        payButton: 'Payer Maintenant - {price}',
        secure: '🔒 Paiement sécurisé traité par SISP',
        included: 'Ce qui est inclus',
        breakfast: 'Petit-déjeuner Inclus',
        wifi: 'Wi-Fi Haut Débit',
        cleaning: 'Ménage Quotidien',
        parking: 'Parking Gratuit',
        help: 'Vous avez des questions ? Nous sommes là pour vous aider !',
        whatsapp: '💬 Discuter sur WhatsApp',
        closing: 'Nous espérons vous voir bientôt !',
        team: 'L\'équipe Casa Tiana',
        specialReq: 'Demandes Spéciales',
    }
};

export const PendingPaymentEmail = ({
    guestName,
    reservationNumber,
    roomName,
    checkIn,
    checkOut,
    guests,
    nights,
    totalPrice,
    specialRequests,
    paymentLink,
    language = 'pt',
}: PendingPaymentEmailProps) => {
    const t = translations[language];
    const formattedPrice = `${totalPrice?.toLocaleString(language === 'pt' ? 'pt-CV' : language === 'fr' ? 'fr-FR' : 'en-US')} CVE`;

    return (
        <Layout preview={`${t.preview} - ${reservationNumber}`}>
            {/* Status Badge */}
            <Section style={statusContainer}>
                <div style={statusBadge}>
                    <Text style={statusText}>✓ {t.badge}</Text>
                </div>
            </Section>

            {/* Welcome */}
            <Heading style={h1}>
                {t.greeting.replace('{name}', guestName)}
            </Heading>

            {/* Reservation Number Gold Box */}
            <Section style={resNumberBox}>
                <Text style={resNumberLabel}>{t.resNumberLabel}</Text>
                <Text style={resNumberValue}>#{reservationNumber}</Text>
            </Section>

            {/* Main Grid Layout */}
            <Section style={gridContainer}>
                <Row>
                    {/* Dates Column */}
                    <Column style={columnStyle}>
                        <div style={dateCardTop}>
                            <Row>
                                <Column style={{ width: '25px', verticalAlign: 'middle' }}>
                                    <Text style={iconStyle}>📅</Text>
                                </Column>
                                <Column>
                                    <Text style={dateLabel}>{t.checkIn}:</Text>
                                    <Text style={dateValue}>{checkIn}</Text>
                                </Column>
                            </Row>
                        </div>
                        <div style={dateCardBottom}>
                            <Row>
                                <Column style={{ width: '25px', verticalAlign: 'middle' }}>
                                    <Text style={iconStyle}>📅</Text>
                                </Column>
                                <Column>
                                    <Text style={dateLabel}>{t.checkOut}:</Text>
                                    <Text style={dateValue}>{checkOut}</Text>
                                </Column>
                            </Row>
                        </div>
                    </Column>

                    {/* Guests Column */}
                    <Column style={columnStyle}>
                        <div style={centerContent}>
                            <Text style={guestsIcon}>👨‍👩‍👧</Text>
                            <Text style={guestsLabel}>{t.guestsLabel}</Text>
                            <Text style={guestsValue}>
                                {t.guestsValue
                                    .replace('{count}', guests.toString())
                                    .replace('{label}', guests === 1 ? t.guest : t.guests)}
                            </Text>
                        </div>
                    </Column>

                    {/* Price Column */}
                    <Column style={columnStyle}>
                        <div style={priceCard}>
                            <Text style={priceValue}>{formattedPrice}</Text>
                            <Text style={priceLabel}>{t.totalLabel}</Text>
                        </div>
                    </Column>
                </Row>
            </Section>

            {/* Special Requests */}
            {specialRequests && (
                <Section style={specialReqSection}>
                    <Text style={specialReqLabel}>
                        <span style={{ marginRight: '8px' }}>💬</span> {t.specialReq}
                    </Text>
                    <Text style={specialReqText}>{specialRequests}</Text>
                </Section>
            )}

            {/* Amenities Grid */}
            <Section style={amenitiesSection}>
                <Row>
                    <Column style={amenityCol}>
                        <div style={amenityCard}>
                            <Text style={amenityIcon}>🥐</Text>
                            <Text style={amenityText}>{t.breakfast}</Text>
                        </div>
                    </Column>
                    <Column style={amenityCol}>
                        <div style={amenityCard}>
                            <Text style={amenityIcon}>Wifi</Text>
                            <Text style={amenityText}>{t.wifi}</Text>
                        </div>
                    </Column>
                    <Column style={amenityCol}>
                        <div style={amenityCard}>
                            <Text style={amenityIcon}>🧹</Text>
                            <Text style={amenityText}>{t.cleaning}</Text>
                        </div>
                    </Column>
                    <Column style={amenityCol}>
                        <div style={amenityCard}>
                            <Text style={amenityIcon}>🅿️</Text>
                            <Text style={amenityText}>{t.parking}</Text>
                        </div>
                    </Column>
                </Row>
            </Section>

            {/* Payment CTA */}
            <Section style={ctaSection}>
                <Button href={paymentLink} style={payButton}>
                    {t.payButton.replace('{price}', formattedPrice)}
                </Button>
                <Text style={secureTex}>{t.secure}</Text>
            </Section>
        </Layout>
    );
};

// Styles
const statusContainer = {
    textAlign: 'center' as const,
    marginBottom: '20px',
};

const statusBadge = {
    backgroundColor: '#34d399', // Greenish for "Confirmed" look in screenshot, but user might want Amber for pending? Screenshot says "Reserva Confirmada". 
    // Wait, if it's pending payment, it should probably be distinct. But the user said "same mold as screenshot". 
    // Screenshot has Green "Reserva Confirmada".
    // I will use amber for "Pending" logic but same shape.
    backgroundColor: '#f59e0b', // Amber for Pending
    borderRadius: '4px',
    display: 'inline-block',
    padding: '8px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const statusText = {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'capitalize' as const,
    margin: '0',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'left' as const,
    margin: '0 0 20px 0',
    paddingLeft: '10px',
};

const resNumberBox = {
    background: 'linear-gradient(90deg, #A89065 0%, #D4BE92 100%)',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: '30px',
    color: '#ffffff',
};

const resNumberLabel = {
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    margin: '0 0 5px 0',
    opacity: 0.9,
};

const resNumberValue = {
    fontSize: '28px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    margin: '0',
};

const gridContainer = {
    marginBottom: '20px',
};

const columnStyle = {
    verticalAlign: 'top',
    padding: '0 5px',
    width: '33.33%',
};

const dateCardTop = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    padding: '12px',
    marginBottom: '2px', // tiny gap
};

const dateCardBottom = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
    padding: '12px',
};

const priceCard = {
    backgroundColor: '#ffffff',
    border: '2px solid #D4BE92',
    borderRadius: '12px',
    padding: '15px 10px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    textAlign: 'center' as const,
};

const priceValue = {
    color: '#D4BE92',
    fontSize: '22px', // slightly smaller to fit
    fontWeight: 'bold',
    margin: '0 0 5px 0',
};

const priceLabel = {
    color: '#4b5563',
    fontSize: '11px',
    margin: '0',
};

const centerContent = {
    textAlign: 'center' as const,
    padding: '10px',
};

const guestsIcon = {
    fontSize: '24px',
    margin: '0 0 5px 0',
};

const guestsLabel = {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0 0 2px 0',
};

const guestsValue = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#374151',
    margin: '0',
};

const iconStyle = {
    fontSize: '16px',
    margin: 0,
};

const dateLabel = {
    color: '#6b7280',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    margin: '0',
};

const dateValue = {
    color: '#1f2937',
    fontSize: '13px',
    fontWeight: 'bold',
    margin: '2px 0 0 0',
};

const specialReqSection = {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
};

const specialReqLabel = {
    color: '#92400e',
    fontSize: '13px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
};

const specialReqText = {
    color: '#b45309',
    fontSize: '14px',
    margin: '0',
};

const amenitiesSection = {
    marginBottom: '30px',
};

const amenityCol = {
    width: '25%',
    padding: '0 5px',
};

const amenityCard = {
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '15px 5px',
    textAlign: 'center' as const,
    height: '100px',
};

const amenityIcon = {
    fontSize: '24px',
    margin: '0 0 10px 0',
};

const amenityText = {
    fontSize: '11px', // smaller font for info cards
    color: '#4b5563',
    fontWeight: 'bold',
    lineHeight: '1.2',
    margin: '0',
};

const ctaSection = {
    textAlign: 'center' as const,
    marginTop: '30px',
    marginBottom: '30px',
};

const payButton = {
    backgroundColor: '#10b981', // Green CTA button
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    padding: '15px 30px',
    borderRadius: '8px',
    display: 'inline-block',
    width: '100%',
    maxWidth: '300px',
};

const secureTex = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '15px',
};

export default PendingPaymentEmail;

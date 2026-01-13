import * as React from 'npm:react@18.3.1';
import { Section, Text, Row, Column, Heading, Button, Hr, Img } from 'npm:@react-email/components@0.0.12';
import { Layout } from './components/Layout.tsx';

interface ReservationEmailProps {
    guestName: string;
    reservationNumber: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    totalPrice: number;
    specialRequests?: string;
}

export const ReservationEmail = ({
    guestName,
    reservationNumber,
    roomName,
    checkIn,
    checkOut,
    guests,
    nights,
    totalPrice,
    specialRequests,
}: ReservationEmailProps) => {
    return (
        <Layout preview={`Confirmação de Reserva - ${reservationNumber}`}>
            {/* Success Badge */}
            <Section style={successBadge}>
                <Text style={successIcon}>✓</Text>
                <Text style={successText}>Reserva Confirmada</Text>
            </Section>

            {/* Welcome Message */}
            <Heading style={h1}>
                Olá, {guestName}! 🌴
            </Heading>
            <Text style={welcomeText}>
                A sua reserva foi confirmada com sucesso! Estamos muito felizes em
                recebê-lo(a) na <strong>Casa Tiana</strong>. Prepare-se para uma
                experiência inesquecível em Mindelo.
            </Text>

            {/* Reservation Number Card */}
            <Section style={reservationCard}>
                <Text style={reservationLabel}>Número da Reserva</Text>
                <Text style={reservationNumber_style}>#{reservationNumber}</Text>
            </Section>

            {/* Details Card */}
            <Section style={detailsCard}>
                <Text style={cardTitle}>
                    <span style={cardTitleIcon}>🏨</span> Detalhes da Estadia
                </Text>

                <Hr style={cardDivider} />

                {/* Room */}
                <div style={detailRow}>
                    <div style={detailIconContainer}>
                        <Text style={detailIcon}>🛏️</Text>
                    </div>
                    <div style={detailContent}>
                        <Text style={detailLabel}>Quarto</Text>
                        <Text style={detailValue}>{roomName}</Text>
                    </div>
                </div>

                {/* Check-in / Check-out */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '20px' }}>
                    <tr>
                        <td width="50%" style={{ verticalAlign: 'top', paddingRight: '10px' }}>
                            <div style={dateCard}>
                                <Text style={dateLabel}>
                                    <span style={dateLabelIcon}>📅</span> Check-in
                                </Text>
                                <Text style={dateValue}>{checkIn}</Text>
                                <Text style={dateTime}>A partir das 14:00</Text>
                            </div>
                        </td>
                        <td width="50%" style={{ verticalAlign: 'top', paddingLeft: '10px' }}>
                            <div style={dateCard}>
                                <Text style={dateLabel}>
                                    <span style={dateLabelIcon}>📅</span> Check-out
                                </Text>
                                <Text style={dateValue}>{checkOut}</Text>
                                <Text style={dateTime}>Até às 12:00</Text>
                            </div>
                        </td>
                    </tr>
                </table>

                {/* Guests & Nights */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '20px' }}>
                    <tr>
                        <td width="50%" style={{ verticalAlign: 'top', paddingRight: '10px' }}>
                            <div style={miniCard}>
                                <Text style={miniCardIcon}>👤</Text>
                                <Text style={miniCardValue}>{guests}</Text>
                                <Text style={miniCardLabel}>{guests === 1 ? 'Hóspede' : 'Hóspedes'}</Text>
                            </div>
                        </td>
                        <td width="50%" style={{ verticalAlign: 'top', paddingLeft: '10px' }}>
                            <div style={miniCard}>
                                <Text style={miniCardIcon}>🌙</Text>
                                <Text style={miniCardValue}>{nights}</Text>
                                <Text style={miniCardLabel}>{nights === 1 ? 'Noite' : 'Noites'}</Text>
                            </div>
                        </td>
                    </tr>
                </table>

                {/* Special Requests */}
                {specialRequests && (
                    <>
                        <Hr style={cardDivider} />
                        <div style={specialRequestsBox}>
                            <Text style={specialRequestsLabel}>
                                <span style={specialRequestsIcon}>💬</span> Pedidos Especiais
                            </Text>
                            <Text style={specialRequestsText}>{specialRequests}</Text>
                        </div>
                    </>
                )}

                {/* Total */}
                <Hr style={totalDivider} />
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td>
                            <Text style={totalLabel}>Total a Pagar</Text>
                        </td>
                        <td style={{ textAlign: 'right' as const }}>
                            <Text style={totalValue}>{totalPrice?.toLocaleString('pt-PT')} CVE</Text>
                        </td>
                    </tr>
                </table>
            </Section>

            {/* Info Cards */}
            <Section style={infoSection}>
                <Text style={infoTitle}>✨ O que está incluído</Text>

                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td width="50%" style={{ paddingRight: '8px', paddingBottom: '12px' }}>
                            <div style={infoCard}>
                                <Text style={infoCardIcon}>🍳</Text>
                                <Text style={infoCardText}>Pequeno-almoço</Text>
                            </div>
                        </td>
                        <td width="50%" style={{ paddingLeft: '8px', paddingBottom: '12px' }}>
                            <div style={infoCard}>
                                <Text style={infoCardIcon}>📶</Text>
                                <Text style={infoCardText}>Wi-Fi Grátis</Text>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td width="50%" style={{ paddingRight: '8px' }}>
                            <div style={infoCard}>
                                <Text style={infoCardIcon}>🧹</Text>
                                <Text style={infoCardText}>Limpeza Diária</Text>
                            </div>
                        </td>
                        <td width="50%" style={{ paddingLeft: '8px' }}>
                            <div style={infoCard}>
                                <Text style={infoCardIcon}>🅿️</Text>
                                <Text style={infoCardText}>Estacionamento</Text>
                            </div>
                        </td>
                    </tr>
                </table>
            </Section>

            {/* Contact CTA */}
            <Section style={ctaSection}>
                <Text style={ctaText}>
                    Tem alguma dúvida? Estamos aqui para ajudar!
                </Text>
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td style={{ textAlign: 'center' as const }}>
                            <Button href="https://wa.me/2389876543" style={whatsappButton}>
                                💬 Falar no WhatsApp
                            </Button>
                        </td>
                    </tr>
                </table>
            </Section>

            {/* Closing */}
            <Text style={closing}>
                Mal podemos esperar para recebê-lo!
                <br /><br />
                Com os melhores cumprimentos,
                <br />
                <strong style={{ color: '#8B7355' }}>Equipa Casa Tiana</strong>
            </Text>
        </Layout>
    );
};

// Premium Styles
const successBadge = {
    textAlign: 'center' as const,
    marginBottom: '30px',
};

const successIcon = {
    display: 'inline-block',
    width: '60px',
    height: '60px',
    lineHeight: '60px',
    fontSize: '30px',
    color: '#ffffff',
    backgroundColor: '#22c55e',
    borderRadius: '50%',
    margin: '0 auto 10px',
};

const successText = {
    color: '#22c55e',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    margin: '0',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: 'bold',
    fontFamily: 'Playfair Display, Georgia, serif',
    textAlign: 'center' as const,
    margin: '0 0 15px',
    lineHeight: '1.3',
};

const welcomeText = {
    color: '#666',
    fontSize: '16px',
    lineHeight: '1.7',
    textAlign: 'center' as const,
    margin: '0 0 30px',
};

const reservationCard = {
    background: 'linear-gradient(135deg, #8B7355 0%, #C4A77D 100%)',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center' as const,
    marginBottom: '25px',
};

const reservationLabel = {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    margin: '0 0 5px',
};

const reservationNumber_style = {
    color: '#ffffff',
    fontSize: '26px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    margin: '0',
    letterSpacing: '2px',
};

const detailsCard = {
    backgroundColor: '#fafafa',
    border: '1px solid #e8e8e8',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '25px',
};

const cardTitle = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

const cardTitleIcon = {
    fontSize: '20px',
};

const cardDivider = {
    borderColor: '#e8e8e8',
    margin: '20px 0',
};

const detailRow = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px',
};

const detailIconContainer = {
    width: '40px',
    height: '40px',
    backgroundColor: '#f0ebe5',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
};

const detailIcon = {
    fontSize: '20px',
    margin: '0',
};

const detailContent = {
    flex: '1',
};

const detailLabel = {
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 4px',
};

const detailValue = {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
};

const dateCard = {
    backgroundColor: '#ffffff',
    border: '1px solid #e8e8e8',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center' as const,
};

const dateLabel = {
    color: '#888',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 8px',
};

const dateLabelIcon = {
    fontSize: '12px',
};

const dateValue = {
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px',
    lineHeight: '1.4',
};

const dateTime = {
    color: '#8B7355',
    fontSize: '12px',
    fontWeight: '500',
    margin: '0',
};

const miniCard = {
    backgroundColor: '#ffffff',
    border: '1px solid #e8e8e8',
    borderRadius: '12px',
    padding: '20px 15px',
    textAlign: 'center' as const,
};

const miniCardIcon = {
    fontSize: '24px',
    margin: '0 0 8px',
};

const miniCardValue = {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 4px',
};

const miniCardLabel = {
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0',
};

const specialRequestsBox = {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '10px',
    padding: '15px',
};

const specialRequestsLabel = {
    color: '#92400e',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 8px',
};

const specialRequestsIcon = {
    fontSize: '14px',
};

const specialRequestsText = {
    color: '#78350f',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0',
};

const totalDivider = {
    borderColor: '#8B7355',
    borderWidth: '2px',
    margin: '25px 0 20px',
};

const totalLabel = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
};

const totalValue = {
    color: '#8B7355',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
};

const infoSection = {
    marginBottom: '25px',
};

const infoTitle = {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 20px',
};

const infoCard = {
    backgroundColor: '#f8f6f3',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center' as const,
};

const infoCardIcon = {
    fontSize: '24px',
    margin: '0 0 8px',
};

const infoCardText = {
    color: '#666',
    fontSize: '13px',
    fontWeight: '500',
    margin: '0',
};

const ctaSection = {
    backgroundColor: '#f0ebe5',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center' as const,
    marginBottom: '25px',
};

const ctaText = {
    color: '#666',
    fontSize: '15px',
    margin: '0 0 15px',
};

const whatsappButton = {
    backgroundColor: '#25D366',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 'bold',
    padding: '14px 28px',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
};

const closing = {
    color: '#666',
    fontSize: '15px',
    lineHeight: '1.7',
    textAlign: 'center' as const,
    margin: '0',
};

export default ReservationEmail;

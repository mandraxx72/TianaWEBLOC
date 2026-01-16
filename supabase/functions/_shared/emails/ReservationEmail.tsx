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
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td width="35%" style={{ verticalAlign: 'top' }}>
                            <div style={dateCard}>
                                <table border={0} cellPadding="0" cellSpacing="0">
                                    <tr>
                                        <td style={{ verticalAlign: 'middle', paddingRight: '5px' }}>
                                            <Img
                                                src="https://casatiana.com/images/email-icons/calendar.png"
                                                width="14"
                                                height="14"
                                                alt="Calendar"
                                            />
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <Text style={dateLabel}>Check-in</Text>
                                        </td>
                                    </tr>
                                </table>
                                <Text style={dateValue}>{checkIn}</Text>
                            </div>
                            <div style={{ ...dateCard, marginTop: '10px' }}>
                                <table border={0} cellPadding="0" cellSpacing="0">
                                    <tr>
                                        <td style={{ verticalAlign: 'middle', paddingRight: '5px' }}>
                                            <Img
                                                src="https://casatiana.com/images/email-icons/calendar.png"
                                                width="14"
                                                height="14"
                                                alt="Calendar"
                                            />
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <Text style={dateLabel}>Check-out</Text>
                                        </td>
                                    </tr>
                                </table>
                                <Text style={dateValue}>{checkOut}</Text>
                            </div>
                        </td>
                        <td width="30%" style={{ verticalAlign: 'middle', textAlign: 'center' as const }}>
                            <div style={miniCard}>
                                <div style={{ marginBottom: '8px' }}>
                                    <Img
                                        src="https://casatiana.com/images/email-icons/guests.png"
                                        width="32"
                                        height="32"
                                        alt="Guests"
                                        style={{ margin: '0 auto' }}
                                    />
                                </div>
                                <Text style={miniCardValue}>{guests}</Text>
                                <Text style={miniCardLabel}>Hóspedes: <br />{guests} Adultos</Text>
                            </div>
                        </td>
                        <td width="35%" style={{ verticalAlign: 'middle', textAlign: 'right' as const }}>
                            <div style={totalPriceBox}>
                                <Text style={totalValue}>{totalPrice?.toLocaleString('pt-PT')} CVE</Text>
                                <Text style={totalPriceLabel}>Preço Total (Incl. Taxas)</Text>
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
            </Section>

            {/* Info Cards */}
            <Section style={infoSection}>
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td width="25%" style={{ paddingRight: '4px' }}>
                            <div style={infoCard}>
                                <div style={{ height: '32px', marginBottom: '8px', textAlign: 'center' as const }}>
                                    <Img
                                        src="https://casatiana.com/images/email-icons/breakfast.png"
                                        width="24"
                                        height="24"
                                        alt="Café da Manhã"
                                        style={{ margin: '0 auto' }}
                                    />
                                </div>
                                <Text style={infoCardText}>Café da Manhã Incluído</Text>
                            </div>
                        </td>
                        <td width="25%" style={{ paddingLeft: '4px' }}>
                            <div style={infoCard}>
                                <div style={{ height: '32px', marginBottom: '8px', textAlign: 'center' as const }}>
                                    <Img
                                        src="https://casatiana.com/images/email-icons/wifi.png"
                                        width="24"
                                        height="24"
                                        alt="Wi-Fi"
                                        style={{ margin: '0 auto' }}
                                    />
                                </div>
                                <Text style={infoCardText}>Wi-Fi de Alta Velocidade</Text>
                            </div>
                        </td>
                        <td width="25%" style={{ paddingLeft: '4px' }}>
                            <div style={infoCard}>
                                <div style={{ height: '32px', marginBottom: '8px', textAlign: 'center' as const }}>
                                    <Img
                                        src="https://casatiana.com/images/email-icons/cleaning.png"
                                        width="24"
                                        height="24"
                                        alt="Limpeza"
                                        style={{ margin: '0 auto' }}
                                    />
                                </div>
                                <Text style={infoCardText}>Limpeza Diária</Text>
                            </div>
                        </td>
                        <td width="25%" style={{ paddingLeft: '4px' }}>
                            <div style={infoCard}>
                                <div style={{ height: '32px', marginBottom: '8px', textAlign: 'center' as const }}>
                                    <Img
                                        src="https://casatiana.com/images/email-icons/parking.png"
                                        width="24"
                                        height="24"
                                        alt="Estacionamento"
                                        style={{ margin: '0 auto' }}
                                    />
                                </div>
                                <Text style={infoCardText}>Estacionamento Gratuito</Text>
                            </div>
                        </td>
                    </tr>
                </table>
            </Section>

            <Section style={ctaSection}>
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td style={{ textAlign: 'center' as const }}>
                            <Button href="https://wa.me/2389876543" style={whatsappButton}>
                                <Img
                                    src="https://casatiana.com/images/email-icons/whatsapp-white.png"
                                    width="16"
                                    height="16"
                                    alt="WhatsApp"
                                    style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}
                                />
                                <span style={{ verticalAlign: 'middle' }}>Fale Conosco no WhatsApp</span>
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
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'left' as const,
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
    padding: '10px',
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
    fontSize: '11px',
    margin: '0',
    lineHeight: '1.2',
};

const totalPriceBox = {
    border: '1px solid #8B7355',
    borderRadius: '8px',
    padding: '15px 10px',
    textAlign: 'center' as const,
    backgroundColor: '#ffffff',
};

const totalPriceLabel = {
    color: '#666',
    fontSize: '11px',
    margin: '5px 0 0',
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
    color: '#1a1a1a',
    fontSize: '22px',
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
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e8e8e8',
    padding: '12px 4px',
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
    backgroundColor: '#22c55e',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 'bold',
    padding: '14px 28px',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
};

const closing = {
    color: '#666',
    fontSize: '15px',
    lineHeight: '1.7',
    textAlign: 'center' as const,
    margin: '0',
};

export default ReservationEmail;

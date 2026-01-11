import * as React from 'npm:react@18.3.1';
import { Section, Text, Row, Column, Heading, Button, Hr } from 'npm:@react-email/components@0.0.12';
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
            <Heading style={h1}>Olá, {guestName}! 🎉</Heading>
            <Text style={text}>
                A sua reserva foi confirmada com sucesso! Estamos muito felizes em recebê-lo(a) na Casa Tiana.
                Aqui estão os detalhes da sua estadia.
            </Text>

            <Section style={box}>
                <Text style={boxTitle}>Detalhes da Reserva</Text>
                <Text style={reservationId}>#{reservationNumber}</Text>

                <Hr style={divider} />

                <Row style={row}>
                    <Column>
                        <Text style={label}>Quarto</Text>
                        <Text style={value}>{roomName}</Text>
                    </Column>
                </Row>

                <Row style={row}>
                    <Column>
                        <Text style={label}>Check-in</Text>
                        <Text style={value}>{checkIn}</Text>
                        <Text style={subValue}>A partir das 14:00</Text>
                    </Column>
                    <Column>
                        <Text style={label}>Check-out</Text>
                        <Text style={value}>{checkOut}</Text>
                        <Text style={subValue}>Até às 12:00</Text>
                    </Column>
                </Row>

                <Row style={row}>
                    <Column>
                        <Text style={label}>Hóspedes</Text>
                        <Text style={value}>{guests} {guests === 1 ? 'pessoa' : 'pessoas'}</Text>
                    </Column>
                    <Column>
                        <Text style={label}>Duração</Text>
                        <Text style={value}>{nights} {nights === 1 ? 'noite' : 'noites'}</Text>
                    </Column>
                </Row>

                {specialRequests && (
                    <Row style={row}>
                        <Column>
                            <Text style={label}>Pedidos Especiais</Text>
                            <Text style={value}>{specialRequests}</Text>
                        </Column>
                    </Row>
                )}

                <Hr style={divider} />

                <Row>
                    <Column>
                        <Text style={totalLabel}>Total</Text>
                    </Column>
                    <Column align="right">
                        <Text style={totalValue}>{totalPrice?.toLocaleString('pt-PT')} CVE</Text>
                    </Column>
                </Row>
            </Section>

            <Section style={infoBox}>
                <Heading as="h3" style={h3}>📍 Informações Importantes</Heading>
                <Text style={infoText}>• O pequeno-almoço está incluído na sua estadia.</Text>
                <Text style={infoText}>• Dispomos de Wi-Fi gratuito em todas as áreas.</Text>
                <Text style={infoText}>• Check-in antecipado sujeito a disponibilidade.</Text>
                <br />
                <Button
                    href="https://wa.me/2381234567" // Replace with actual WhatsApp number if available
                    style={button}
                >
                    Falar no WhatsApp
                </Button>
            </Section>

            <Text style={closing}>
                Se tiver alguma dúvida, não hesite em contactar-nos.
                <br />
                Com os melhores cumprimentos,
                <br />
                <strong>Equipa Casa Tiana</strong>
            </Text>
        </Layout>
    );
};

// Styles
const h1 = {
    color: '#8B7355',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 20px',
};

const text = {
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px',
    textAlign: 'center' as const,
};

const box = {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderTop: '4px solid #8B7355',
};

const boxTitle = {
    color: '#8B7355',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0',
    textAlign: 'center' as const,
};

const reservationId = {
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '5px 0 20px',
    textAlign: 'center' as const,
};

const divider = {
    borderColor: '#eee',
    margin: '15px 0',
};

const row = {
    marginBottom: '15px',
};

const label = {
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '4px',
};

const value = {
    color: '#333',
    fontSize: '16px',
    fontWeight: '500',
    margin: '0',
};

const subValue = {
    color: '#999',
    fontSize: '12px',
    margin: '2px 0 0',
};

const totalLabel = {
    color: '#333',
    fontSize: '18px',
    fontWeight: 'bold',
};

const totalValue = {
    color: '#8B7355',
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'right' as const,
};

const infoBox = {
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const h3 = {
    color: '#333',
    fontSize: '18px',
    margin: '0 0 15px',
};

const infoText = {
    color: '#666',
    fontSize: '14px',
    margin: '5px 0',
};

const button = {
    backgroundColor: '#25D366',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'inline-block',
    marginTop: '15px',
};

const closing = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.6',
    textAlign: 'center' as const,
    marginTop: '30px',
};

export default ReservationEmail;

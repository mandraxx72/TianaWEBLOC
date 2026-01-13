import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Hr } from 'npm:@react-email/components@0.0.12';
import { Layout } from './components/Layout.tsx';

interface WelcomeEmailProps {
    name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
    return (
        <Layout preview="Bem-vindo à Casa Tiana! 🌴">
            {/* Welcome Badge */}
            <Section style={welcomeBadge}>
                <Text style={welcomeIcon}>🌴</Text>
            </Section>

            {/* Main Heading */}
            <Heading style={h1}>
                Bem-vindo, {name}!
            </Heading>

            <Text style={subtitle}>
                A sua conta foi criada com sucesso
            </Text>

            <Hr style={divider} />

            <Text style={text}>
                É um prazer tê-lo(a) connosco! A <strong style={{ color: '#8B7355' }}>Casa Tiana</strong> é
                mais do que um lugar para ficar — é a sua casa longe de casa no coração de Mindelo.
            </Text>

            <Text style={text}>
                Estamos ansiosos para lhe proporcionar uma estadia inesquecível, cheia de conforto,
                tranquilidade e a autêntica hospitalidade cabo-verdiana.
            </Text>

            {/* Feature Cards */}
            <Section style={featuresSection}>
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td width="33%" style={{ padding: '0 5px', verticalAlign: 'top' }}>
                            <div style={featureCard}>
                                <Text style={featureIcon}>🏖️</Text>
                                <Text style={featureTitle}>Localização</Text>
                                <Text style={featureText}>Perto da praia e do centro</Text>
                            </div>
                        </td>
                        <td width="33%" style={{ padding: '0 5px', verticalAlign: 'top' }}>
                            <div style={featureCard}>
                                <Text style={featureIcon}>🥐</Text>
                                <Text style={featureTitle}>Pequeno-almoço</Text>
                                <Text style={featureText}>Produtos locais frescos</Text>
                            </div>
                        </td>
                        <td width="33%" style={{ padding: '0 5px', verticalAlign: 'top' }}>
                            <div style={featureCard}>
                                <Text style={featureIcon}>✨</Text>
                                <Text style={featureTitle}>Conforto</Text>
                                <Text style={featureText}>Quartos premium</Text>
                            </div>
                        </td>
                    </tr>
                </table>
            </Section>

            {/* CTA Section */}
            <Section style={ctaSection}>
                <Text style={ctaTitle}>Pronto para a sua próxima aventura?</Text>
                <Text style={ctaText}>
                    Descubra os nossos quartos acolhedores e reserve já a sua estadia em Mindelo.
                </Text>
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                        <td style={{ textAlign: 'center' as const }}>
                            <Button href="https://casatiana.com" style={primaryButton}>
                                🏠 Explorar Quartos
                            </Button>
                        </td>
                    </tr>
                </table>
            </Section>

            {/* What's Next */}
            <Section style={nextStepsSection}>
                <Text style={nextStepsTitle}>O que pode fazer agora</Text>

                <div style={stepItem}>
                    <Text style={stepNumber}>1</Text>
                    <div style={stepContent}>
                        <Text style={stepTitle}>Explore os Quartos</Text>
                        <Text style={stepText}>Veja as fotos e comodidades de cada espaço</Text>
                    </div>
                </div>

                <div style={stepItem}>
                    <Text style={stepNumber}>2</Text>
                    <div style={stepContent}>
                        <Text style={stepTitle}>Faça uma Reserva</Text>
                        <Text style={stepText}>Escolha as datas e reserve online</Text>
                    </div>
                </div>

                <div style={stepItem}>
                    <Text style={stepNumber}>3</Text>
                    <div style={stepContent}>
                        <Text style={stepTitle}>Prepare a Viagem</Text>
                        <Text style={stepText}>Receba dicas sobre Mindelo e Cabo Verde</Text>
                    </div>
                </div>
            </Section>

            {/* Contact */}
            <Section style={contactSection}>
                <Text style={contactText}>
                    Tem alguma pergunta? Estamos aqui para ajudar!
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
                Até breve em Mindelo!
                <br /><br />
                Com os melhores cumprimentos,
                <br />
                <strong style={{ color: '#8B7355' }}>Equipa Casa Tiana</strong>
            </Text>
        </Layout>
    );
};

// Premium Styles
const welcomeBadge = {
    textAlign: 'center' as const,
    marginBottom: '20px',
};

const welcomeIcon = {
    fontSize: '50px',
    margin: '0',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '32px',
    fontWeight: 'bold',
    fontFamily: 'Playfair Display, Georgia, serif',
    textAlign: 'center' as const,
    margin: '0 0 10px',
    lineHeight: '1.2',
};

const subtitle = {
    color: '#22c55e',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    margin: '0 0 25px',
};

const divider = {
    borderColor: '#e8e8e8',
    margin: '0 0 25px',
};

const text = {
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.8',
    textAlign: 'center' as const,
    margin: '0 0 16px',
};

const featuresSection = {
    margin: '35px 0',
};

const featureCard = {
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    padding: '20px 10px',
    textAlign: 'center' as const,
    border: '1px solid #f0f0f0',
};

const featureIcon = {
    fontSize: '28px',
    margin: '0 0 10px',
};

const featureTitle = {
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 5px',
};

const featureText = {
    color: '#888',
    fontSize: '12px',
    lineHeight: '1.4',
    margin: '0',
};

const ctaSection = {
    background: 'linear-gradient(135deg, #8B7355 0%, #C4A77D 100%)',
    borderRadius: '16px',
    padding: '35px 25px',
    textAlign: 'center' as const,
    marginBottom: '30px',
};

const ctaTitle = {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    fontFamily: 'Playfair Display, Georgia, serif',
    margin: '0 0 10px',
};

const ctaText = {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 20px',
};

const primaryButton = {
    backgroundColor: '#ffffff',
    color: '#8B7355',
    fontSize: '15px',
    fontWeight: 'bold',
    padding: '14px 32px',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
};

const nextStepsSection = {
    backgroundColor: '#f8f6f3',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '25px',
};

const nextStepsTitle = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 25px',
};

const stepItem = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '18px',
};

const stepNumber = {
    display: 'inline-block',
    width: '28px',
    height: '28px',
    lineHeight: '28px',
    backgroundColor: '#8B7355',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    borderRadius: '50%',
    marginRight: '15px',
    flexShrink: '0',
};

const stepContent = {
    flex: '1',
};

const stepTitle = {
    color: '#1a1a1a',
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 3px',
};

const stepText = {
    color: '#888',
    fontSize: '13px',
    margin: '0',
};

const contactSection = {
    textAlign: 'center' as const,
    marginBottom: '30px',
};

const contactText = {
    color: '#666',
    fontSize: '14px',
    margin: '0 0 15px',
};

const whatsappButton = {
    backgroundColor: '#25D366',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '12px 24px',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
};

const closing = {
    color: '#666',
    fontSize: '15px',
    lineHeight: '1.7',
    textAlign: 'center' as const,
    margin: '0',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
};

export default WelcomeEmail;

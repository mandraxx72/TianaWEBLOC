import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Img } from 'npm:@react-email/components@0.0.12';
import { Layout } from './components/Layout.tsx';

interface WelcomeEmailProps {
    name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
    return (
        <Layout preview="Bem-vindo à Casa Tiana!">
            <Heading style={h1}>Bem-vindo, {name}! 👋</Heading>

            <Text style={text}>
                É um prazer tê-lo(a) connosco. A Casa Tiana é mais do que um lugar para ficar; é a sua casa longe de casa em Mindelo.
            </Text>

            <Text style={text}>
                Estamos ansiosos para lhe proporcionar uma estadia inesquecível, cheia de conforto, tranquilidade e a autêntica hospitalidade cabo-verdiana.
            </Text>

            <Section style={features}>
                <div style={feature}>
                    <Heading as="h3" style={featureTitle}>🏖️ Localização Privilegiada</Heading>
                    <Text style={featureText}>Perto da praia e do centro da cidade.</Text>
                </div>
                <div style={feature}>
                    <Heading as="h3" style={featureTitle}>🥐 Pequeno-almoço Delicioso</Heading>
                    <Text style={featureText}>Produtos locais frescos todos os dias.</Text>
                </div>
                <div style={feature}>
                    <Heading as="h3" style={featureTitle}>✨ Conforto Premium</Heading>
                    <Text style={featureText}>Quartos equipados para o seu relaxamento.</Text>
                </div>
            </Section>

            <Section style={ctaSection}>
                <Text style={ctaText}>Já planeou a sua próxima visita?</Text>
                <Button
                    href="https://tiana-casa-web.lovable.app/" // Replace with actual production URL
                    style={button}
                >
                    Reservar Agora
                </Button>
            </Section>

            <Text style={closing}>
                Até breve,
                <br />
                <strong>Equipa Casa Tiana</strong>
            </Text>
        </Layout>
    );
};

// Styles
const h1 = {
    color: '#8B7355',
    fontSize: '26px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 24px',
};

const text = {
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.8',
    marginBottom: '16px',
    textAlign: 'center' as const,
};

const features = {
    margin: '32px 0',
    textAlign: 'center' as const,
};

const feature = {
    marginBottom: '20px',
};

const featureTitle = {
    color: '#333',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px',
};

const featureText = {
    color: '#666',
    fontSize: '14px',
    margin: '0',
};

const ctaSection = {
    backgroundColor: '#f8f8f8',
    padding: '32px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    margin: '32px 0',
};

const ctaText = {
    color: '#333',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
};

const button = {
    backgroundColor: '#8B7355',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'inline-block',
    boxShadow: '0 4px 6px rgba(139, 115, 85, 0.2)',
};

const closing = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.6',
    textAlign: 'center' as const,
    marginTop: '40px',
    fontStyle: 'italic',
};

export default WelcomeEmail;

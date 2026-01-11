import * as React from 'npm:react@18.3.1';
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Text,
    Hr,
    Link,
    Font,
    Img,
} from 'npm:@react-email/components@0.0.12';

interface LayoutProps {
    preview?: string;
    children: React.ReactNode;
}

export const Layout = ({ preview, children }: LayoutProps) => {
    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            {preview && <Preview>{preview}</Preview>}
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>Casa Tiana</Text>
                        <Text style={subLogo}>Mindelo, São Vicente</Text>
                    </Section>

                    <Section style={content}>
                        {children}
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Casa Tiana. Todos os direitos reservados.
                        </Text>
                        <Text style={footerText}>
                            Rua de Lisboa, Mindelo, São Vicente, Cabo Verde
                        </Text>
                        <div style={socialLinks}>
                            <Link href="https://instagram.com" style={link}>Instagram</Link>
                            <span style={{ margin: '0 8px' }}>•</span>
                            <Link href="https://facebook.com" style={link}>Facebook</Link>
                        </div>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: 'Roboto, Verdana, sans-serif',
    padding: '20px 0',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    maxWidth: '600px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const header = {
    backgroundColor: '#8B7355', // Brand gold/brown
    padding: '30px 20px',
    textAlign: 'center' as const,
};

const logo = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
    letterSpacing: '1px',
};

const subLogo = {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    margin: '5px 0 0',
};

const content = {
    padding: '40px 30px',
};

const footer = {
    backgroundColor: '#1a1a1a',
    padding: '30px 20px',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#888888',
    fontSize: '12px',
    lineHeight: '1.5',
    margin: '4px 0',
};

const socialLinks = {
    marginTop: '20px',
};

const link = {
    color: '#8B7355',
    fontSize: '12px',
    textDecoration: 'none',
};

export default Layout;

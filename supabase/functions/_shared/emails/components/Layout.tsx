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
                    fontFamily="Playfair Display"
                    fallbackFontFamily="Georgia"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="Arial"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            {preview && <Preview>{preview}</Preview>}
            <Body style={main}>
                <Container style={container}>
                    {/* Elegant Header with Gradient */}
                    <Section style={header}>
                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <tr>
                                <td style={{ textAlign: 'left' as const }}>
                                    <Text style={logo}>Casa Tiana</Text>
                                    <Text style={subLogo}>Boutique Guesthouse</Text>
                                </td>
                                <td style={{ textAlign: 'right' as const, verticalAlign: 'top' }}>
                                    <table align="right" border={0} cellPadding="0" cellSpacing="0" style={{ width: 'auto' }}>
                                        <tr>
                                            <td style={{ verticalAlign: 'middle', paddingRight: '4px' }}>
                                                <Img
                                                    src="https://casatiana.com/images/email-icons/location.png"
                                                    width="16"
                                                    height="16"
                                                    alt="Location"
                                                />
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <Text style={location}>
                                                    Mindelo,<br />São Vicente
                                                </Text>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </Section>

                    {/* Decorative Wave Divider */}
                    <Section style={waveDivider}>
                        <svg width="100%" height="20" viewBox="0 0 600 20" preserveAspectRatio="none">
                            <path d="M0,20 C150,0 450,0 600,20 L600,20 L0,20 Z" fill="#ffffff" />
                        </svg>
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        {children}
                    </Section>

                    {/* Elegant Footer */}
                    <Section style={footer}>
                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <tr>
                                <td style={{ textAlign: 'center' as const }}>
                                    {/* Social Icons */}
                                    <div style={socialContainer}>
                                        <Link href="https://instagram.com/casatiana" style={socialLink}>
                                            <span style={socialIcon}>📷</span>
                                        </Link>
                                        <Link href="https://facebook.com/casatiana" style={socialLink}>
                                            <span style={socialIcon}>📘</span>
                                        </Link>
                                        <Link href="https://wa.me/2389876543" style={socialLink}>
                                            <span style={socialIcon}>💬</span>
                                        </Link>
                                    </div>

                                    <Hr style={footerDivider} />

                                    <Text style={footerBrand}>Casa Tiana</Text>
                                    <Text style={footerAddress}>
                                        Rua de Lisboa, Mindelo<br />
                                        São Vicente, Cabo Verde
                                    </Text>

                                    <div style={footerLinks}>
                                        <Link href="https://casatiana.com/termos" style={footerLink}>Termos e Condições</Link>
                                        <span style={footerSeparator}>•</span>
                                        <Link href="https://casatiana.com/privacidade" style={footerLink}>Política de Privacidade</Link>
                                        <span style={footerSeparator}>•</span>
                                        <Link href="https://casatiana.com/cancelar" style={footerLink}>Cancelar Inscrição</Link>
                                    </div>

                                    <Text style={copyright}>
                                        © {new Date().getFullYear()} Casa Tiana. Todos os direitos reservados.
                                    </Text>
                                </td>
                            </tr>
                        </table>
                    </Section>
                </Container>

                {/* Unsubscribe / Legal Footer */}
                <Container style={legalContainer}>
                    <Text style={legalText}>
                        Este email foi enviado porque fez uma reserva na Casa Tiana.
                        <br />
                        <Link href="https://casatiana.com/privacidade" style={legalLink}>Política de Privacidade</Link>
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Premium Styles
const main = {
    backgroundColor: '#f8f6f3',
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '40px 20px',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    maxWidth: '600px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(139, 115, 85, 0.15), 0 8px 25px rgba(0,0,0,0.08)',
};

const header = {
    background: 'linear-gradient(135deg, #8B7355 0%, #A08B70 50%, #C4A77D 100%)',
    padding: '40px 30px',
};

const logo = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    fontFamily: 'Playfair Display, Georgia, serif',
    margin: '0',
    letterSpacing: '1px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const subLogo = {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14px',
    fontWeight: '300',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    margin: '8px 0 0',
};

const location = {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '12px',
    margin: '0',
    lineHeight: '1.4',
    textAlign: 'right' as const,
};

const locationIcon = {
    fontSize: '14px',
};

const waveDivider = {
    backgroundColor: 'linear-gradient(135deg, #8B7355 0%, #C4A77D 100%)',
    marginTop: '-20px',
    padding: '0',
};

const content = {
    padding: '50px 40px',
    backgroundColor: '#ffffff',
};

const footer = {
    background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)',
    padding: '40px 30px',
    textAlign: 'center' as const,
};

const socialContainer = {
    marginBottom: '25px',
};

const socialLink = {
    display: 'inline-block',
    margin: '0 10px',
    textDecoration: 'none',
};

const socialIcon = {
    fontSize: '24px',
    display: 'inline-block',
    width: '44px',
    height: '44px',
    lineHeight: '44px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    transition: 'background-color 0.3s ease',
};

const footerDivider = {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '25px 0',
};

const footerBrand = {
    color: '#C4A77D',
    fontSize: '20px',
    fontFamily: 'Playfair Display, Georgia, serif',
    fontWeight: 'bold',
    margin: '0 0 10px',
};

const footerAddress = {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    lineHeight: '1.8',
    margin: '0 0 20px',
};

const footerLinks = {
    marginBottom: '20px',
};

const footerLink = {
    color: '#C4A77D',
    fontSize: '13px',
    textDecoration: 'none',
};

const footerSeparator = {
    color: 'rgba(255,255,255,0.3)',
    margin: '0 12px',
};

const copyright = {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    margin: '0',
};

const legalContainer = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '25px 20px',
};

const legalText = {
    color: '#999',
    fontSize: '11px',
    lineHeight: '1.6',
    textAlign: 'center' as const,
    margin: '0',
};

const legalLink = {
    color: '#8B7355',
    textDecoration: 'underline',
};

export default Layout;


import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
// import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

export interface LayoutProps {
  children: ReactNode;
  onBookingClick?: () => void;
  headerProps?: {
    siteName?: string;
    menuItems?: Array<{
      href: string;
      label: string;
    }>;
  };
  footerProps?: {
    siteName?: string;
    description?: string;
    contactInfo?: {
      address?: string[];
      phone?: string[];
      email?: string;
    };
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      tripadvisor?: string;
    };
    awards?: string[];
  };
}

const HEADER_OFFSET_PX = 96;

const Layout = ({
  children,
  onBookingClick,
  headerProps = {},
  footerProps = {}
}: LayoutProps) => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = decodeURIComponent(location.hash.replace("#", ""));

    // Wait a tick for the target section to be mounted/rendered.
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;

      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
      window.scrollTo({ top, behavior: "smooth" });
    }, 0);

    return () => window.clearTimeout(t);
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header onBookingClick={onBookingClick || (() => { })} {...headerProps} />
      <main>
        {children}
      </main>
      <Footer {...footerProps} />
      {/* <FloatingWhatsApp /> */}
    </div>
  );
};

export default Layout;

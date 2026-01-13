
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, User, LogOut, Shield, CalendarDays, Coins } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  onBookingClick: () => void;
  siteName?: string;
  menuItems?: Array<{
    href: string;
    label: string;
  }>;
}

const Header = ({
  onBookingClick,
  siteName = "Casa Tiana",
  menuItems
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkStaffRole = async () => {
      if (!user) {
        setIsStaff(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setIsStaff(data?.some(r => r.role === "admin" || r.role === "staff") || false);
    };
    checkStaffRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSectionNav = (href: string) => {
    const hashIndex = href.indexOf("#");
    const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";

    if (hash) {
      navigate({ pathname: "/", hash });
      return;
    }

    navigate(href);
  };

  const languages = [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
    { code: "fr", label: "Français" }
  ];

  const defaultMenuItems = [
    { href: "#sobre", label: t('nav.about') },
    { href: "#quartos", label: t('nav.rooms') },
    { href: "#galeria", label: t('nav.gallery') },
    { href: "#avaliacoes", label: t('nav.reviews') },
    { href: "#blog", label: t('nav.blog') },
    { href: "#contato", label: t('nav.contact') }
  ];

  const navigationItems = menuItems || defaultMenuItems;

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

  const textColorClass = "text-white hover:text-white/90";
  const logoColorClass = "text-white";

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isTransparent
        ? "bg-transparent py-5"
        : "bg-gradient-to-r from-gold-start to-gold-end shadow-soft py-3"
        }`}
    >
      <div className="container mx-auto px-4">
        {/* Desktop */}
        <div className="hidden md:flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Top row (md) / Left (lg) */}
          <div className="flex items-center justify-between gap-4 lg:justify-start lg:flex-shrink-0">
            <Link
              to="/"
              className="flex-shrink-0 transition-opacity hover:opacity-90"
            >
              <img src="/logo-white.png" alt={siteName} className="h-16 w-auto" />
            </Link>

            {/* Ações à direita (md) / Right (lg) */}
            <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 flex-shrink-0 lg:hidden">
              {/* Currency Toggle */}
              <button
                onClick={() => setCurrency(currency === "CVE" ? "EUR" : "CVE")}
                className={`flex items-center space-x-1 transition-colors ${textColorClass}`}
                title="Alterar moeda"
              >
                <Coins className="h-4 w-4" />
                <span className="text-sm font-medium">{currency}</span>
              </button>

              {/* Language Selector */}
              <div className="relative group">
                <button className={`flex items-center space-x-1 transition-colors ${textColorClass}`}>
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{language.toUpperCase()}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as 'pt' | 'en' | 'fr')}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  {isStaff && (
                    <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="px-2 text-white hover:bg-white/20">
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/minhas-reservas")}
                    className="px-2 text-white hover:bg-white/20"
                    aria-label={t('button.myReservations')}
                    title={t('button.myReservations')}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Button>

                  <span className="hidden sm:inline text-xs truncate max-w-[140px] text-white/90">
                    {user.email}
                  </span>

                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 text-white hover:bg-white/20" aria-label={t('button.logout')} title={t('button.logout')}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className={`border-foreground/30 ${isTransparent ? 'border-white/50 text-white hover:bg-white/20 hover:text-white' : ''}`}
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('button.login')}
                </Button>
              )}

              <Button onClick={onBookingClick} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t('button.book')}
              </Button>
            </div>
          </div>

          {/* Nav row (md) / Center (lg) */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:flex-1">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleSectionNav(item.href)}
                className={`transition-colors duration-200 font-medium whitespace-nowrap text-sm ${textColorClass}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions on lg */}
          <div className="hidden lg:flex flex-wrap items-center justify-end gap-x-2 gap-y-2 flex-shrink-0">
            {/* Currency Toggle */}
            <button
              onClick={() => setCurrency(currency === "CVE" ? "EUR" : "CVE")}
              className={`flex items-center space-x-1 transition-colors ${textColorClass}`}
              title="Alterar moeda"
            >
              <Coins className="h-4 w-4" />
              <span className="text-sm font-medium">{currency}</span>
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <button className={`flex items-center space-x-1 transition-colors ${textColorClass}`}>
                <Globe className="h-4 w-4" />
                <span className="text-sm">{language.toUpperCase()}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'pt' | 'en' | 'fr')}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {isStaff && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="px-2 text-white hover:bg-white/20" aria-label="Admin" title="Admin">
                    <Shield className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/minhas-reservas")}
                  className="px-2 text-white hover:bg-white/20"
                  aria-label={t('button.myReservations')}
                  title={t('button.myReservations')}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>

                <span className="hidden xl:inline text-xs truncate max-w-[140px] text-white/90">
                  {user.email}
                </span>

                <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 text-white hover:bg-white/20" aria-label={t('button.logout')} title={t('button.logout')}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className={`border-foreground/30 ${isTransparent ? 'border-white/50 text-white hover:bg-white/20 hover:text-white' : ''}`}>
                <User className="h-4 w-4 mr-2" />
                {t('button.login')}
              </Button>
            )}

            <Button onClick={onBookingClick} size="sm" className="bg-white text-gold hover:bg-white/90 shadow-md font-semibold transition-all hover:scale-105">
              {t('button.book')}
            </Button>
          </div>
        </div>

        {/* Mobile Site Name and Menu Button */}
        <div className="md:hidden flex items-center justify-between w-full">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <img src="/logo-white.png" alt={siteName} className="h-14 w-auto" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`${textColorClass}`}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border animate-slide-in">
            <nav className="flex flex-col space-y-4 mt-4">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    handleSectionNav(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-white hover:text-white/80 transition-colors duration-200 font-medium"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col space-y-4 pt-4 border-t border-white/20">
                {/* Currency Toggle */}
                <div className="flex items-center space-x-2 text-white">
                  <Coins className="h-4 w-4" />
                  <button
                    onClick={() => setCurrency(currency === "CVE" ? "EUR" : "CVE")}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {currency === "CVE" ? "CVE → EUR" : "EUR → CVE"}
                  </button>
                </div>

                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'pt' | 'en' | 'fr')}
                    className="bg-transparent border-none text-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {user ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </span>
                    {isStaff && (
                      <Button variant="outline" size="sm" onClick={() => { navigate("/admin"); setIsMobileMenuOpen(false); }}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => { navigate("/minhas-reservas"); setIsMobileMenuOpen(false); }}>
                      {t('button.myReservations')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('button.logout')}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => { navigate("/auth"); setIsMobileMenuOpen(false); }}>
                    <User className="h-4 w-4 mr-2" />
                    {t('button.login.mobile')}
                  </Button>
                )}

                <Button onClick={onBookingClick} className="w-full">
                  {t('button.book.mobile')}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

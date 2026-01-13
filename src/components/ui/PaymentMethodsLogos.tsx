import visaSecure from '@/assets/payment/visa-secure.png';
import mastercardIdCheck from '@/assets/payment/mastercard-idcheck.png';
import amexSafekey from '@/assets/payment/amex-safekey.png';
import vinti4 from '@/assets/payment/vinti4.png';
import { Shield } from 'lucide-react';

interface PaymentMethodsLogosProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PaymentMethodsLogos = ({ 
  size = 'md', 
  showLabel = true,
  className = '' 
}: PaymentMethodsLogosProps) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  const logoHeight = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Pagamento seguro</span>
        </div>
      )}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <img 
          src={visaSecure} 
          alt="Visa Secure" 
          className={`${logoHeight} w-auto object-contain`}
        />
        <img 
          src={mastercardIdCheck} 
          alt="Mastercard ID Check" 
          className={`${logoHeight} w-auto object-contain`}
        />
        <img 
          src={vinti4} 
          alt="Vinti4" 
          className={`${logoHeight} w-auto object-contain`}
        />
        <img 
          src={amexSafekey} 
          alt="American Express SafeKey" 
          className={`${logoHeight} w-auto object-contain`}
        />
      </div>
    </div>
  );
};

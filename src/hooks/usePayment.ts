import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentData {
  reservationId: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  billAddrCity?: string;
  billAddrLine1?: string;
  billAddrPostCode?: string;
}

interface PaymentResult {
  success: boolean;
  paymentReference?: string;
  formHtml?: string;
  redirectUrl?: string;
  error?: string;
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const initiatePayment = async (data: PaymentData): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      console.log("[usePayment] Initiating payment for reservation:", data.reservationId);
      
      const { data: response, error } = await supabase.functions.invoke("sisp-create-payment", {
        body: data
      });

      if (error) {
        console.error("[usePayment] Error from edge function:", error);
        throw error;
      }

      if (!response.success) {
        throw new Error(response.error || "Failed to create payment");
      }

      console.log("[usePayment] Payment initiated successfully:", response.paymentReference);
      
      return {
        success: true,
        paymentReference: response.paymentReference,
        formHtml: response.formHtml,
        redirectUrl: response.redirectUrl
      };
    } catch (error: any) {
      console.error("[usePayment] Error initiating payment:", error);
      
      toast({
        title: "Erro no Pagamento",
        description: "Não foi possível iniciar o pagamento. Por favor, tente novamente.",
        variant: "destructive"
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const openPaymentWindow = (formHtml: string) => {
    // Open payment form in a new window/tab
    const paymentWindow = window.open("", "_blank");
    
    if (paymentWindow) {
      paymentWindow.document.write(formHtml);
      paymentWindow.document.close();
    } else {
      // Fallback: create blob and open
      const blob = new Blob([formHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      URL.revokeObjectURL(url);
    }
  };

  return {
    initiatePayment,
    openPaymentWindow,
    isProcessing
  };
};

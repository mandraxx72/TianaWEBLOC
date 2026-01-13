import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// Use js-sha512 library - same as official SISP Node.js example
import { sha512 } from "https://esm.sh/js-sha512@0.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  reservationId: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  // 3DS billing address fields - aligned with frontend
  billAddrCity?: string;
  billAddrLine1?: string;
  billAddrPostCode?: string;
}

// Encode string to Base64 with proper UTF-8 support (for non-ASCII characters like "ã", "é", etc.)
function utf8ToBase64(str: string): string {
  // Convert string to UTF-8 bytes, then to Base64
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
}

// Remove accents/diacritics from a string (fallback for safer encoding)
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Build 3DSServer JSON for purchaseRequest (Base64 encoded)
function build3DSServerJson(
  email: string,
  phone: string,
  name: string,
  billAddrLine1?: string,
  billAddrCity?: string,
  billAddrPostCode?: string
): string {
  const today = new Date();
  const dateStr = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  // CRITICAL: Remove accents from all text fields to avoid encoding issues
  // SISP gateway may not handle UTF-8 properly in Base64 purchaseRequest
  const safeCity = removeAccents(billAddrCity || "Mindelo").substring(0, 50);
  const safeAddrLine1 = removeAccents(billAddrLine1 || "Sao Vicente").substring(0, 50);
  const safeEmail = email.substring(0, 254);

  // Country code 132 = Cape Verde (ISO 3166-1 numeric)
  const json3DS = {
    acctID: safeEmail.substring(0, 64),
    acctInfo: {
      chAccAgeInd: "01", // No account (guest checkout)
      chAccDate: dateStr,
      chAccChange: dateStr,
      chAccPwChange: dateStr,
      chAccPwChangeInd: "01",
      suspiciousAccActivity: "01" // Not suspicious
    },
    email: safeEmail,
    addrMatch: "Y",
    billAddrCity: safeCity,
    billAddrCountry: "132", // Cape Verde
    billAddrLine1: safeAddrLine1,
    billAddrLine2: "",
    billAddrLine3: "",
    billAddrPostCode: (billAddrPostCode || "0000").substring(0, 16),
    billAddrState: "SV", // Sao Vicente
    mobilePhone: {
      cc: "238", // Cape Verde country code
      subscriber: phone.replace(/\D/g, "").substring(0, 15) || "0000000"
    }
  };

  const jsonString = JSON.stringify(json3DS);
  console.log("[sisp-create-payment] 3DSServer JSON:", jsonString);

  // Use standard btoa since we removed accents - JSON should be pure ASCII now
  return btoa(jsonString);
}

// Generate SHA-512 hash and return as Base64 - EXACTLY as official SISP Node.js code
// Official code: sha512.digest(input) returns array of bytes, then btoa(String.fromCharCode.apply(null, u8))
function sha512Base64(text: string): string {
  // CRITICAL: Use sha512.digest() which returns array of numbers (bytes)
  // This is exactly what the official SISP Node.js code uses
  const digestArray = sha512.digest(text);

  // Convert byte array to Base64 using apply() - exactly as official code ToBase64 function
  // Official: btoa(String.fromCharCode.apply(null, u8))
  const base64 = btoa(String.fromCharCode.apply(null, digestArray as unknown as number[]));

  return base64;
}

// Generate SISP fingerprint according to 3DS 2.2.0 specification
// Based on official SISP Node.js code:
// toHash = GenerateSHA512StringToBase64(posAutCode) + timestamp + Number(parseFloat(amount)*1000) + merchantRef.trim() + ...
function generateFingerprint(
  posAutCode: string,
  timestamp: string,
  amountForHash: number, // This is amount * 1000 (e.g., 6900000 for 6900 CVE)
  merchantRef: string,
  merchantSession: string,
  posID: string,
  currency: string,
  transactionCode: string,
  entityCode?: string,
  referenceNumber?: string
): string {
  // Step 1: Hash the posAutCode with SHA-512 and encode to Base64
  const posAutCodeHash = sha512Base64(posAutCode);

  console.log("[sisp-create-payment] posAutCode length:", posAutCode.length);
  console.log("[sisp-create-payment] posAutCodeHash (first 20):", posAutCodeHash.substring(0, 20) + "...");
  console.log("[sisp-create-payment] posAutCodeHash length:", posAutCodeHash.length);

  // Step 2: Concatenate all fields in order (without separators)
  // CRITICAL: Amount must be converted exactly as per official Node.js code
  const merchantRefTrimmed = merchantRef.trim();
  const merchantSessionTrimmed = merchantSession.trim();
  const posIDTrimmed = posID.trim();
  const currencyTrimmed = currency.trim();
  const transactionCodeTrimmed = transactionCode.trim();

  // Build concatenated string exactly as SISP expects
  let concatenated = posAutCodeHash + timestamp + amountForHash + merchantRefTrimmed +
    merchantSessionTrimmed + posIDTrimmed + currencyTrimmed + transactionCodeTrimmed;

  // Only add entityCode and referenceNumber for service payments (transactionCode 2 or 3)
  if (transactionCodeTrimmed === "2" || transactionCodeTrimmed === "3") {
    if (entityCode && entityCode !== "") {
      // Remove leading zeros as per SISP docs
      concatenated += parseInt(entityCode.trim(), 10).toString();
    }
    if (referenceNumber && referenceNumber !== "") {
      // Remove leading zeros as per SISP docs
      concatenated += parseInt(referenceNumber.trim(), 10).toString();
    }
  }

  // Debug log
  console.log("[sisp-create-payment] Fingerprint components:");
  console.log("  - posAutCodeHash (first 20):", posAutCodeHash.substring(0, 20) + "...");
  console.log("  - timestamp:", timestamp);
  console.log("  - amountForHash (Number, *1000):", amountForHash);
  console.log("  - merchantRef:", merchantRefTrimmed);
  console.log("  - merchantSession:", merchantSessionTrimmed);
  console.log("  - posID:", posIDTrimmed);
  console.log("  - currency:", currencyTrimmed);
  console.log("  - transactionCode:", transactionCodeTrimmed);
  console.log("  - concatenated string (first 100):", concatenated.substring(0, 100) + "...");
  console.log("  - concatenated length:", concatenated.length);

  // Step 3: Hash the concatenated string with SHA-512 and encode to Base64
  const fingerprint = sha512Base64(concatenated);

  console.log("[sisp-create-payment] Fingerprint generated (first 30 chars):", fingerprint.substring(0, 30) + "...");
  console.log("[sisp-create-payment] Fingerprint length:", fingerprint.length);

  return fingerprint;
}

// Generate short merchant reference (max 15 chars alphanumeric)
function generateMerchantRef(): string {
  const now = Date.now().toString(36).toUpperCase(); // Base36 for shorter string
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `R${now}${random}`.substring(0, 15);
}

// Generate timestamp in SISP format: YYYY-MM-DD HH:mm:ss
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Generate unique merchant session
function generateMerchantSession(): string {
  return "S" + Date.now().toString();
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[sisp-create-payment] Request received:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get SISP credentials
    const posID = Deno.env.get("SISP_POS_ID");
    const posAutCode = Deno.env.get("SISP_POS_AUTH_CODE");
    const sispUrl = Deno.env.get("SISP_URL");

    if (!posID || !posAutCode || !sispUrl) {
      console.error("[sisp-create-payment] Missing SISP credentials");
      throw new Error("SISP credentials not configured");
    }

    const data: PaymentRequest = await req.json();

    // CRITICAL: Separate amount for form vs amount for fingerprint
    // Form amount: CVE value (e.g., 6900)
    // Fingerprint amount: CVE * 1000 (e.g., 6900000)
    const amountCVE = Math.round(data.amount); // Amount in CVE (no decimals)
    const amountForHash = amountCVE * 1000; // For fingerprint calculation
    const amountForForm = amountCVE.toString(); // For form field - CVE value as string

    console.log("[sisp-create-payment] Payment request for reservation:", data.reservationId);
    console.log("[sisp-create-payment] Amount CVE (original):", data.amount);
    console.log("[sisp-create-payment] Amount CVE (rounded):", amountCVE);
    console.log("[sisp-create-payment] Amount for Hash (*1000):", amountForHash);
    console.log("[sisp-create-payment] Amount for Form (CVE string):", amountForForm);

    // Generate required fields
    const merchantSession = generateMerchantSession();
    const merchantRef = generateMerchantRef(); // Short ref for SISP (max 15 chars)
    const timestamp = generateTimestamp();
    const transactionCode = "1"; // Purchase transaction
    const currency = "132"; // CVE currency code

    // Callback URL - SISP will POST results here
    // IMPORTANT: NO query params! SISP appends its own params with "?" which corrupts our params
    const callbackUrl = `${supabaseUrl}/functions/v1/sisp-callback`;
    const origin = req.headers.get("origin") || "https://casa-tiana.lovable.app";

    console.log("[sisp-create-payment] Reservation ID:", data.reservationId);
    console.log("[sisp-create-payment] Merchant Ref (short):", merchantRef);
    console.log("[sisp-create-payment] Merchant Session:", merchantSession);
    console.log("[sisp-create-payment] Timestamp:", timestamp);
    console.log("[sisp-create-payment] Callback URL (clean, no params):", callbackUrl);
    console.log("[sisp-create-payment] Origin for redirect:", origin);

    // Generate fingerprint with amount * 1000 (as per official SISP code)
    const fingerprint = generateFingerprint(
      posAutCode,
      timestamp,
      amountForHash, // Use amount * 1000 for fingerprint
      merchantRef,
      merchantSession,
      posID,
      currency,
      transactionCode
    );

    // Build 3DSServer JSON for purchaseRequest (Base64 encoded)
    // Now using correct field names aligned with frontend
    const purchaseRequestBase64 = build3DSServerJson(
      data.customerEmail,
      data.customerPhone,
      data.customerName,
      data.billAddrLine1,
      data.billAddrCity,
      data.billAddrPostCode
    );

    console.log("[sisp-create-payment] purchaseRequest (first 50 chars):", purchaseRequestBase64.substring(0, 50) + "...");

    // Build SISP payment form data - ORDER MUST MATCH OFFICIAL DOCUMENTATION
    // CRITICAL: urlMerchantResponse has NO query params to avoid SISP corruption
    const paymentData: Record<string, string> = {
      transactionCode: transactionCode,
      posID: posID,
      merchantRef: merchantRef,
      merchantSession: merchantSession,
      amount: amountForForm, // CVE value (e.g., "6900"), NOT multiplied
      currency: currency,
      is3DSec: "1",
      urlMerchantResponse: callbackUrl, // NO query params - SISP adds its own with "?"
      languageMessages: "pt",
      timeStamp: timestamp,
      fingerprintversion: "1",
      entityCode: "",          // Required field (empty for transactionCode 1)
      referenceNumber: "",     // Required field (empty for transactionCode 1)
      fingerprint: fingerprint,
      purchaseRequest: purchaseRequestBase64
    };

    console.log("[sisp-create-payment] All form fields prepared");
    console.log("[sisp-create-payment] Form amount:", amountForForm);
    console.log("[sisp-create-payment] Hash amount:", amountForHash);
    console.log("[sisp-create-payment] timeStamp:", timestamp);
    console.log("[sisp-create-payment] fingerprint (first 30):", fingerprint.substring(0, 30) + "...");

    // Fetch reservation to get user_id for payment_logs
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("user_id")
      .eq("id", data.reservationId)
      .single();

    if (fetchError) {
      console.error("[sisp-create-payment] Error fetching reservation:", fetchError);
      throw fetchError;
    }

    const reservationUserId = reservation?.user_id || null;
    console.log("[sisp-create-payment] Reservation user_id:", reservationUserId);

    // Update reservation with payment info including merchantSession for callback lookup
    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        payment_status: "processing",
        payment_method: "sisp_card",
        payment_reference: merchantSession // CRITICAL: Store merchantSession for callback lookup
      })
      .eq("id", data.reservationId);

    if (updateError) {
      console.error("[sisp-create-payment] Error updating reservation:", updateError);
      throw updateError;
    }

    console.log("[sisp-create-payment] Reservation updated with payment_reference:", merchantSession);

    // Log payment initiation with mapping to reservation and user
    await supabase.from("payment_logs").insert({
      reservation_id: data.reservationId,
      user_id: reservationUserId,
      event_type: "payment_initiated",
      payment_reference: merchantSession,
      amount: amountCVE,
      currency: "CVE",
      sisp_response: {
        ...paymentData,
        reservationId: data.reservationId,
        merchantRef: merchantRef,
        timestamp: timestamp,
        origin: origin, // Store origin for callback redirect
        amountCVE: amountCVE,
        amountForHash: amountForHash,
        fingerprint_preview: fingerprint.substring(0, 30) + "..."
      }
    });

    console.log("[sisp-create-payment] Payment form generated for session:", merchantSession);
    console.log("[sisp-create-payment] SISP URL:", sispUrl);

    // Generate HTML form for SISP redirect
    const formHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Processando Pagamento...</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #8B7355 0%, #C4A77D 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 { margin: 0 0 10px; }
    p { margin: 0; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Redirecionando para pagamento...</h2>
    <p>Aguarde enquanto o conectamos ao gateway seguro.</p>
  </div>
  <form id="sispForm" method="POST" action="${sispUrl}?FingerPrint=${encodeURIComponent(fingerprint)}&TimeStamp=${encodeURIComponent(timestamp)}&FingerPrintVersion=1">
    ${Object.entries(paymentData).map(([key, value]) =>
      `<input type="hidden" name="${key}" value="${value}">`
    ).join('\n    ')}
  </form>
  <script>
    document.getElementById('sispForm').submit();
  </script>
</body>
</html>
    `;

    return new Response(
      JSON.stringify({
        success: true,
        merchantSession,
        formHtml,
        redirectUrl: sispUrl,
        formData: paymentData
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[sisp-create-payment] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

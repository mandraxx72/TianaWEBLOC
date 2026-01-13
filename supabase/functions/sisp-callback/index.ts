import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SISPCallback {
  // SISP 3DS 2.2.0 callback parameters
  messageType?: string; // "8", "10", "M", "P" = success, "6" = error
  merchantRespCP?: string; // Clearing Period (success code)
  merchantRespTid?: string; // Transaction ID
  merchantRespMerchantRef?: string; // Merchant Reference
  merchantRespMerchantSession?: string; // Merchant Session
  merchantRespPurchaseAmount?: string; // Amount
  merchantRespMessageID?: string; // Message ID
  merchantRespTimeStamp?: string;
  merchantRespReferenceNumber?: string;
  merchantRespEntityCode?: string;
  merchantRespPan?: string; // Masked card number
  merchantRespClientReceipt?: string;
  merchantRespRespCode?: string; // Response code
  merchantRespReloadCode?: string;
  merchantRespErrorCode?: string;
  merchantRespErrorDescription?: string;
  merchantRespErrorDetail?: string;
  merchantRespAdditionalErrorMessage?: string;
  resultFingerPrint?: string; // Note: capital P in FingerPrint
  resultFingerprint?: string; // Alternative casing
  UserCancelled?: string;
  // Legacy fields
  resultCode?: string;
  resultMsg?: string;
}

// Success message types according to SISP documentation
const SUCCESS_MESSAGE_TYPES = ["8", "10", "M", "P"];

// Generate SHA-512 hash and return as Base64
async function sha512Base64(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray));
}

// Generate response fingerprint for validation
// Based on official SISP Java code for successful response validation
async function generateResponseFingerprint(
  posAutCode: string,
  messageType: string,
  clearingPeriod: string | undefined,
  transactionId: string | undefined,
  merchantRef: string,
  merchantSession: string,
  amount: number, // Already in SISP format (amount * 1000)
  messageId: string | undefined,
  pan: string | undefined,
  respCode: string | undefined,
  timestamp: string | undefined,
  referenceNumber: string | undefined,
  entityCode: string | undefined,
  clientReceipt: string | undefined,
  additionalErrorMessage: string | undefined,
  reloadCode: string | undefined
): Promise<string> {
  // Step 1: Hash the posAutCode
  const posAutCodeHash = await sha512Base64(posAutCode);

  // Step 2: Build concatenation string according to SISP Java code:
  // strToHash = EncodedPOSAuthCode + messageType.trim() +
  //   (clearingPeriod ? Long.parseLong(clearingPeriod) : "") +
  //   (transactionId ? Long.parseLong(transactionId) : "") +
  //   merchantRef.trim() + merchantSession.trim() +
  //   (amount * 1000) + messageId.trim() + pan.trim() +
  //   respCode.trim() + timestamp + referenceNumber + entityCode +
  //   clientReceipt.trim() + additionalErrorMessage.trim() + reloadCode.trim()

  let strToHash = posAutCodeHash + messageType.trim();

  // Add clearingPeriod as number if present
  if (clearingPeriod && clearingPeriod.trim() !== "") {
    strToHash += parseInt(clearingPeriod.trim(), 10) || "";
  }

  // Add transactionId as number if present
  if (transactionId && transactionId.trim() !== "") {
    strToHash += parseInt(transactionId.trim(), 10) || "";
  }

  strToHash += merchantRef.trim();
  strToHash += merchantSession.trim();
  strToHash += amount; // Already as number
  strToHash += (messageId || "").trim();
  strToHash += (pan || "").trim();
  strToHash += (respCode || "").trim();
  strToHash += (timestamp || "").trim();
  strToHash += (referenceNumber || "").trim();
  strToHash += (entityCode || "").trim();
  strToHash += (clientReceipt || "").trim();
  strToHash += (additionalErrorMessage || "").trim();
  strToHash += (reloadCode || "").trim();

  console.log("[sisp-callback] Response fingerprint components:");
  console.log("  - messageType:", messageType);
  console.log("  - clearingPeriod:", clearingPeriod);
  console.log("  - transactionId:", transactionId);
  console.log("  - merchantRef:", merchantRef);
  console.log("  - merchantSession:", merchantSession);
  console.log("  - amount:", amount);
  console.log("  - strToHash length:", strToHash.length);
  console.log("  - strToHash (first 100):", strToHash.substring(0, 100) + "...");

  // Step 3: Hash the concatenated string
  const fingerprint = await sha512Base64(strToHash);

  console.log("[sisp-callback] Calculated response fingerprint (first 30):", fingerprint.substring(0, 30) + "...");

  return fingerprint;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[sisp-callback] ===========================================");
  console.log("[sisp-callback] Callback received:", req.method);
  console.log("[sisp-callback] URL:", req.url);
  console.log("[sisp-callback] Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const posAutCode = Deno.env.get("SISP_POS_AUTH_CODE")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let callbackData: SISPCallback = {};
  let origin = "https://casa-tiana.lovable.app";

  try {
    // Extract origin and reservationId from URL params if provided (legacy support)
    const url = new URL(req.url);
    let originParam = url.searchParams.get("origin");
    let reservationIdFromUrl = url.searchParams.get("reservationId");

    // Clean up reservationId - SISP may append its params to it
    if (reservationIdFromUrl && reservationIdFromUrl.includes("?")) {
      console.log("[sisp-callback] Cleaning reservationId - contains query params:", reservationIdFromUrl);
      reservationIdFromUrl = reservationIdFromUrl.split("?")[0];
      console.log("[sisp-callback] Cleaned reservationId:", reservationIdFromUrl);
    }

    // Clean up origin if it has SISP params appended
    if (originParam && originParam.includes("?")) {
      console.log("[sisp-callback] Cleaning origin - contains query params:", originParam);
      originParam = originParam.split("?")[0];
      console.log("[sisp-callback] Cleaned origin:", originParam);
    }

    if (originParam) {
      origin = originParam;
      console.log("[sisp-callback] Origin from URL param:", origin);
    }
    if (reservationIdFromUrl) {
      console.log("[sisp-callback] Reservation ID from URL param:", reservationIdFromUrl);
    }

    // Parse callback data (SISP sends as form-urlencoded or JSON)
    const contentType = req.headers.get("content-type") || "";
    console.log("[sisp-callback] Content-Type:", contentType);

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      console.log("[sisp-callback] Parsing form data...");
      for (const [key, value] of formData.entries()) {
        console.log(`[sisp-callback] Form field: ${key} = ${value}`);
        callbackData[key as keyof SISPCallback] = value.toString();
      }
    } else if (contentType.includes("application/json")) {
      callbackData = await req.json();
      console.log("[sisp-callback] Parsed JSON data");
    } else {
      // Try to parse URL params for GET requests or fallback
      console.log("[sisp-callback] Parsing URL params...");
      for (const [key, value] of url.searchParams.entries()) {
        if (key !== "origin" && key !== "reservationId") {
          console.log(`[sisp-callback] URL param: ${key} = ${value}`);
          callbackData[key as keyof SISPCallback] = value;
        }
      }
    }

    console.log("[sisp-callback] Full callback data:", JSON.stringify(callbackData, null, 2));

    // Extract key information from SISP response
    const messageType = callbackData.messageType || (callbackData as any).messageType;
    const merchantSession = callbackData.merchantRespMerchantSession || (callbackData as any).merchantSession || "";
    const merchantRef = callbackData.merchantRespMerchantRef || (callbackData as any).merchantRef || "";
    const transactionId = callbackData.merchantRespTid;
    const clearingPeriod = callbackData.merchantRespCP;
    const purchaseAmount = callbackData.merchantRespPurchaseAmount || (callbackData as any).amount;
    const messageId = callbackData.merchantRespMessageID || "";
    const pan = callbackData.merchantRespPan || "";
    const respCode = callbackData.merchantRespRespCode || "";
    const timestamp = callbackData.merchantRespTimeStamp || "";
    const referenceNumber = callbackData.merchantRespReferenceNumber || "";
    const entityCode = callbackData.merchantRespEntityCode || "";
    const clientReceipt = callbackData.merchantRespClientReceipt || "";
    const additionalErrorMessage = callbackData.merchantRespAdditionalErrorMessage || "";
    const reloadCode = callbackData.merchantRespReloadCode || "";
    const errorCode = callbackData.merchantRespErrorCode;
    const errorDescription = callbackData.merchantRespErrorDescription;
    const userCancelled = callbackData.UserCancelled === "true";
    const receivedFingerprint = callbackData.resultFingerPrint || callbackData.resultFingerprint || "";

    // Check for 3DS session data - indicates this is an intermediate 3DS redirect
    const e3dsSessionData = (callbackData as any).e3dsSessionData;
    const is3DSRedirect = !!e3dsSessionData && !messageType;

    console.log("[sisp-callback] Message Type:", messageType);
    console.log("[sisp-callback] Merchant Ref:", merchantRef);
    console.log("[sisp-callback] Merchant Session:", merchantSession);
    console.log("[sisp-callback] Transaction ID:", transactionId);
    console.log("[sisp-callback] Clearing Period:", clearingPeriod);
    console.log("[sisp-callback] User Cancelled:", userCancelled);
    console.log("[sisp-callback] Is 3DS Redirect:", is3DSRedirect);
    console.log("[sisp-callback] e3dsSessionData:", e3dsSessionData);
    console.log("[sisp-callback] Received Fingerprint (first 30):", receivedFingerprint.substring(0, 30) + "...");

    // ROBUST RESERVATION LOOKUP: Try multiple strategies
    let reservationId: string | null = null;
    let lookupMethod = "none";

    // Strategy 1: Try URL param (legacy, may be corrupted)
    if (reservationIdFromUrl && reservationIdFromUrl.length === 36) {
      // Basic UUID format check
      reservationId = reservationIdFromUrl;
      lookupMethod = "url_param";
      console.log("[sisp-callback] Using reservationId from URL param:", reservationId);
    }

    // Strategy 2: Look up by merchantSession (payment_reference) - MOST RELIABLE
    if (!reservationId && merchantSession) {
      console.log("[sisp-callback] Looking up reservation by merchantSession:", merchantSession);

      const { data: reservation, error: lookupError } = await supabase
        .from("reservations")
        .select("id")
        .eq("payment_reference", merchantSession)
        .single();

      if (reservation && !lookupError) {
        reservationId = reservation.id;
        lookupMethod = "merchant_session";
        console.log("[sisp-callback] Found reservation by merchantSession:", reservationId);
      } else {
        console.log("[sisp-callback] No reservation found by merchantSession:", lookupError?.message);
      }
    }

    // Strategy 3: Look up origin from payment_logs if not in URL
    if (!originParam && merchantSession) {
      console.log("[sisp-callback] Looking up origin from payment_logs for merchantSession:", merchantSession);

      const { data: paymentLog, error: logError } = await supabase
        .from("payment_logs")
        .select("sisp_response")
        .eq("payment_reference", merchantSession)
        .eq("event_type", "payment_initiated")
        .single();

      if (paymentLog && !logError && paymentLog.sisp_response?.origin) {
        origin = paymentLog.sisp_response.origin;
        console.log("[sisp-callback] Found origin from payment_logs:", origin);
      }
    }

    console.log("[sisp-callback] Final reservation ID:", reservationId);
    console.log("[sisp-callback] Lookup method:", lookupMethod);
    console.log("[sisp-callback] Final origin:", origin);

    // Fetch user_id from reservation for payment_logs
    let reservationUserId: string | null = null;
    if (reservationId) {
      const { data: reservationData, error: reservationFetchError } = await supabase
        .from("reservations")
        .select("user_id")
        .eq("id", reservationId)
        .single();

      if (reservationData && !reservationFetchError) {
        reservationUserId = reservationData.user_id;
        console.log("[sisp-callback] Found reservation user_id:", reservationUserId);
      } else {
        console.log("[sisp-callback] Could not fetch reservation user_id:", reservationFetchError?.message);
      }
    }

    // Determine payment status based on SISP response
    let paymentStatus = "failed";
    let reservationStatus = "pending";
    let eventType = "payment_failed";
    let fingerprintValid = false;

    // Handle intermediate 3DS redirect - this is NOT a final payment result
    // IMPORTANT: Do NOT redirect the user here! This breaks the 3DS flow.
    if (is3DSRedirect) {
      console.log("[sisp-callback] This is an intermediate 3DS redirect, not a final result");
      console.log("[sisp-callback] Returning simple OK response to allow 3DS flow to continue");

      await supabase.from("payment_logs").insert({
        reservation_id: reservationId || null,
        user_id: reservationUserId,
        event_type: "3ds_redirect",
        payment_reference: merchantSession,
        sisp_response: callbackData,
        amount: purchaseAmount ? Math.round(parseInt(purchaseAmount)) : null
      });

      // Return a simple response - DO NOT redirect!
      return new Response("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    if (userCancelled) {
      paymentStatus = "pending";
      eventType = "payment_cancelled";
      console.log("[sisp-callback] Payment was cancelled by user");
    } else if (SUCCESS_MESSAGE_TYPES.includes(messageType)) {
      // Check for success message types: "8", "10", "M", "P"
      console.log("[sisp-callback] Success messageType detected:", messageType);

      // SECURITY: Validate response fingerprint before marking as paid
      if (receivedFingerprint && posAutCode) {
        const amountNumber = purchaseAmount ? parseInt(purchaseAmount) : 0;

        const calculatedFingerprint = await generateResponseFingerprint(
          posAutCode,
          messageType,
          clearingPeriod,
          transactionId,
          merchantRef,
          merchantSession,
          amountNumber,
          messageId,
          pan,
          respCode,
          timestamp,
          referenceNumber,
          entityCode,
          clientReceipt,
          additionalErrorMessage,
          reloadCode
        );

        fingerprintValid = calculatedFingerprint === receivedFingerprint;

        console.log("[sisp-callback] Fingerprint validation:");
        console.log("  - Received (first 30):", receivedFingerprint.substring(0, 30) + "...");
        console.log("  - Calculated (first 30):", calculatedFingerprint.substring(0, 30) + "...");
        console.log("  - Match:", fingerprintValid);

        if (fingerprintValid) {
          paymentStatus = "paid";
          reservationStatus = "confirmed";
          eventType = "payment_success";
          console.log("[sisp-callback] Payment successful! Fingerprint validated.");
        } else {
          paymentStatus = "failed";
          eventType = "payment_fingerprint_mismatch";
          console.error("[sisp-callback] SECURITY WARNING: Fingerprint mismatch! Possible fraud attempt.");
        }
      } else {
        // If no fingerprint received, still mark as success but log warning
        paymentStatus = "paid";
        reservationStatus = "confirmed";
        eventType = "payment_success_no_fingerprint";
        console.warn("[sisp-callback] Payment marked as success but no fingerprint to validate");
      }
    } else if (messageType === "6") {
      // messageType "6" = Error
      paymentStatus = "failed";
      eventType = "payment_failed";
      console.log("[sisp-callback] Payment failed. Error:", errorDescription || errorCode);
    } else if (clearingPeriod === "000" || clearingPeriod === "00" || clearingPeriod === "0") {
      // Legacy: Check clearing period for success
      paymentStatus = "paid";
      reservationStatus = "confirmed";
      eventType = "payment_success_legacy";
      console.log("[sisp-callback] Payment successful! CP=", clearingPeriod);
    } else {
      console.log("[sisp-callback] Payment failed. Unknown response format. MessageType:", messageType);
    }

    // Log the callback event
    const logResult = await supabase.from("payment_logs").insert({
      reservation_id: reservationId || null,
      user_id: reservationUserId,
      event_type: eventType,
      payment_reference: merchantSession,
      sisp_response: {
        ...callbackData,
        lookupMethod: lookupMethod,
        fingerprintValidation: {
          received: receivedFingerprint ? receivedFingerprint.substring(0, 30) + "..." : null,
          valid: fingerprintValid
        }
      },
      amount: purchaseAmount ? Math.round(parseInt(purchaseAmount)) : null,
      error_message: errorDescription || errorCode || null
    });

    if (logResult.error) {
      console.error("[sisp-callback] Error logging payment:", logResult.error);
    } else {
      console.log("[sisp-callback] Payment logged successfully");
    }

    // Update reservation if we have the ID
    if (reservationId) {
      const updateData: Record<string, any> = {
        payment_status: paymentStatus,
        sisp_transaction_id: transactionId || null
      };

      if (paymentStatus === "paid") {
        updateData.status = reservationStatus;
        updateData.paid_at = new Date().toISOString();
      }

      console.log("[sisp-callback] Updating reservation:", reservationId, updateData);

      const { error: updateError } = await supabase
        .from("reservations")
        .update(updateData)
        .eq("id", reservationId);

      if (updateError) {
        console.error("[sisp-callback] Error updating reservation:", updateError);
      } else {
        console.log("[sisp-callback] Reservation updated successfully");

        // If payment successful, send confirmation email
        if (paymentStatus === "paid") {
          try {
            const { data: reservation, error: fetchError } = await supabase
              .from("reservations")
              .select("*")
              .eq("id", reservationId)
              .single();

            if (fetchError) {
              console.error("[sisp-callback] Error fetching reservation:", fetchError);
            } else if (reservation) {
              console.log("[sisp-callback] Sending confirmation email to:", reservation.guest_email);

              const emailResult = await supabase.functions.invoke("send-reservation-email", {
                body: {
                  reservationNumber: reservation.reservation_number,
                  guestName: reservation.guest_name,
                  guestEmail: reservation.guest_email,
                  roomName: reservation.room_name,
                  checkIn: reservation.check_in,
                  checkOut: reservation.check_out,
                  guests: reservation.guests,
                  nights: reservation.nights,
                  totalPrice: reservation.total_price,
                  specialRequests: reservation.special_requests,
                  paymentConfirmed: true
                }
              });

              if (emailResult.error) {
                console.error("[sisp-callback] Error sending email:", emailResult.error);
              } else {
                console.log("[sisp-callback] Confirmation email sent successfully");
              }
            }
          } catch (emailError) {
            console.error("[sisp-callback] Exception sending email:", emailError);
          }
        }
      }
    } else {
      console.warn("[sisp-callback] No reservation ID found in callback!");
    }

    // Build redirect URL
    let redirectUrl = `${origin}/payment-result?status=${paymentStatus}`;
    if (merchantSession) redirectUrl += `&ref=${encodeURIComponent(merchantSession)}`;
    if (reservationId) redirectUrl += `&reservation=${encodeURIComponent(reservationId)}`;

    console.log("[sisp-callback] Redirecting to:", redirectUrl);
    console.log("[sisp-callback] ===========================================");

    // Return redirect HTML page
    const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <title>Processando resultado...</title>
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
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Processando resultado do pagamento...</p>
    <p><a href="${redirectUrl}" style="color: white;">Clique aqui</a> se não for redirecionado.</p>
  </div>
  <script>
    window.location.href = "${redirectUrl}";
  </script>
</body>
</html>
    `;

    return new Response(redirectHtml, {
      status: 200,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[sisp-callback] CRITICAL ERROR:", error);
    console.error("[sisp-callback] Stack:", error.stack);

    // Log error to database
    try {
      await supabase.from("payment_logs").insert({
        event_type: "callback_error",
        sisp_response: callbackData,
        error_message: error.message
      });
    } catch (logError) {
      console.error("[sisp-callback] Failed to log error:", logError);
    }

    // Redirect to error page
    const errorRedirect = `${origin}/payment-result?status=error`;

    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="2;url=${errorRedirect}">
  <title>Erro</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 50px;">
  <h2>Erro no processamento</h2>
  <p>Redirecionando... <a href="${errorRedirect}">Clique aqui</a></p>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

serve(handler);

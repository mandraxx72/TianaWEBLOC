import * as React from "npm:react@18.3.1";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { render } from "npm:@react-email/render@0.0.12";
import { PendingPaymentEmail } from "../_shared/emails/PendingPaymentEmail.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PendingPaymentEmailRequest {
    reservationId: string;
    reservationNumber: string;
    guestName: string;
    guestEmail: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    totalPrice: number;
    specialRequests?: string;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const data: PendingPaymentEmailRequest = await req.json();

        console.log("Sending pending payment email to:", data.guestEmail);

        const checkInDate = new Date(data.checkIn).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const checkOutDate = new Date(data.checkOut).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generate payment link - user can click to pay from my-reservations page
        const paymentLink = `https://casatiana.com/my-reservations?pay=${data.reservationId}`;

        const emailHtml = await render(
            React.createElement(PendingPaymentEmail, {
                guestName: data.guestName,
                reservationNumber: data.reservationNumber,
                roomName: data.roomName,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: data.guests,
                nights: data.nights,
                totalPrice: data.totalPrice,
                specialRequests: data.specialRequests,
                paymentLink: paymentLink
            })
        );

        // Email to guest
        const guestEmailResponse = await resend.emails.send({
            from: "Casa Tiana <reservas@casatiana.com>",
            to: [data.guestEmail],
            subject: `Reserva Pendente de Pagamento - ${data.reservationNumber}`,
            html: emailHtml,
        });

        console.log("Pending payment email sent successfully:", guestEmailResponse);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Pending payment email sent successfully",
                guestEmailId: guestEmailResponse.data?.id
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    } catch (error: any) {
        console.error("Error in send-pending-payment-email function:", error);
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

import * as React from "npm:react@18.3.1";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { render } from "npm:@react-email/render@0.0.12";
import { WelcomeEmail } from "../_shared/emails/WelcomeEmail.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
    email: string;
    name: string;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const data: WelcomeEmailRequest = await req.json();

        console.log("Sending welcome email to:", data.email);

        const emailHtml = await render(
            React.createElement(WelcomeEmail, { name: data.name })
        );

        // Email to guest
        const emailResponse = await resend.emails.send({
            from: "Casa Tiana <reservas@casatiana.com>",
            to: [data.email],
            subject: `Bem-vindo à Casa Tiana! 🌴`,
            html: emailHtml,
        });

        console.log("Welcome email sent successfully:", emailResponse);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Welcome email sent successfully",
                emailId: emailResponse.data?.id
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    } catch (error: any) {
        console.error("Error in send-welcome-email function:", error);
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

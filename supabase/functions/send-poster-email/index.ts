import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PosterEmailRequest {
  donorName: string;
  donorEmail: string;
  cause: string;
  amount?: number;
  aiMessage: string;
  posterBase64: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { donorName, donorEmail, cause, amount, aiMessage, posterBase64 }: PosterEmailRequest = await req.json();

    // Validate required fields
    if (!donorName || !donorEmail || !posterBase64) {
      throw new Error("Missing required fields: donorName, donorEmail, and posterBase64 are required");
    }

    // Convert base64 to buffer for attachment
    const base64Data = posterBase64.replace(/^data:image\/\w+;base64,/, "");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Street Cause VIIT <noreply@send.streetcauseviit.org>",
        to: [donorEmail],
        subject: `Thank You for Your Generous Donation, ${donorName}! 💚`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #16a34a; margin: 0; font-size: 28px;">Thank You, ${donorName}! 💚</h1>
                <p style="color: #666; margin-top: 10px; font-size: 16px;">Your kindness makes a real difference</p>
              </div>
              
              <!-- Main Content -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                  Dear <strong>${donorName}</strong>,
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 15px;">
                  We are deeply grateful for your generous contribution to <strong>${cause}</strong>${amount ? ` of ₹${amount}` : ''}. 
                  Your support empowers us to continue our mission of creating positive change in our community.
                </p>
                <p style="color: #555; font-style: italic; font-size: 15px; line-height: 1.6; margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.5); border-radius: 8px;">
                  "${aiMessage}"
                </p>
              </div>
              
              <!-- Poster Attachment Note -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  📎 <strong>Your Thank You Poster is attached!</strong><br>
                  Feel free to share it on social media to inspire others to contribute.
                </p>
              </div>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin-bottom: 25px;">
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Share your support and inspire others!</p>
                <a href="https://streetcauseviit.org" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px;">
                  Visit Our Website
                </a>
              </div>
              
              <!-- Footer -->
              <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  With heartfelt gratitude,<br>
                  <strong style="color: #16a34a;">Team Street Cause VIIT</strong>
                </p>
                <p style="color: #aaa; font-size: 11px; margin-top: 15px;">
                  16 Years of Compassion in Action | Vision 2030
                </p>
              </div>
              
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: `ThankYou-${donorName.replace(/\s+/g, '_')}.png`,
            content: base64Data,
          },
        ],
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(`Failed to send email: ${JSON.stringify(responseData)}`);
    }

    console.log("Poster email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-poster-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

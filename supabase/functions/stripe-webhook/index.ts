import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_SECRET_KEY = "sk_test_51THhwURbuCz623s5baln3lP89hotNuEY8hwqANh61SBkluvIBAJ2eQZYvTtsUoBDvBo9vZt0UL2iizAiSwlxpU5P001OWsUjxr";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Try to parse the event (webhook secret validation is optional for now)
    let event: Stripe.Event;
    
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Webhook event:", event.type);

    // Handle subscription events
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "invoice.payment_succeeded"
    ) {
      let userId: string | null = null;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        userId = session.metadata?.userId || null;
      } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;
        userId = subscription.metadata?.userId || null;
      } else if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        // Get subscription metadata
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          userId = subscription.metadata?.userId || null;
        }
      }

      if (userId) {
        console.log("Activating Pro for user:", userId);
        const { error } = await supabase
          .from("app_settings")
          .upsert({
            user_id: userId,
            is_pro: true,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error activating Pro:", error);
        } else {
          console.log("Pro activated successfully for user:", userId);
        }
      }
    }

    // Handle subscription cancellation/expiration
    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "invoice.payment_failed"
    ) {
      let userId: string | null = null;

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        userId = subscription.metadata?.userId || null;
      } else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          userId = subscription.metadata?.userId || null;
        }
      }

      if (userId) {
        console.log("Deactivating Pro for user:", userId);
        await supabase
          .from("app_settings")
          .upsert({
            user_id: userId,
            is_pro: false,
            updated_at: new Date().toISOString(),
          });
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

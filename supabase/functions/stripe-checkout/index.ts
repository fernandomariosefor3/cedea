import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_SECRET_KEY = "sk_test_51THhwURbuCz623s5baln3lP89hotNuEY8hwqANh61SBkluvIBAJ2eQZYvTtsUoBDvBo9vZt0UL2iizAiSwlxpU5P001OWsUjxr";

// Price IDs will be created dynamically if not set
let MONTHLY_PRICE_ID = "";
let ANNUAL_PRICE_ID = "";

async function ensurePrices(stripe: Stripe) {
  // Check if we already have prices stored
  if (MONTHLY_PRICE_ID && ANNUAL_PRICE_ID) {
    return { monthly: MONTHLY_PRICE_ID, annual: ANNUAL_PRICE_ID };
  }

  // Search for existing product
  const products = await stripe.products.list({ limit: 10 });
  let product = products.data.find((p) => p.name === "EmDia Pro");

  if (!product) {
    product = await stripe.products.create({
      name: "EmDia Pro",
      description: "Acesso ilimitado ao EmDia - controle financeiro pessoal",
    });
  }

  // Search for existing prices
  const prices = await stripe.prices.list({ product: product.id, limit: 10 });
  
  let monthlyPrice = prices.data.find(
    (p) => p.recurring?.interval === "month" && p.currency === "brl" && p.active
  );
  let annualPrice = prices.data.find(
    (p) => p.recurring?.interval === "year" && p.currency === "brl" && p.active
  );

  if (!monthlyPrice) {
    monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 999, // R$ 9,99
      currency: "brl",
      recurring: { interval: "month" },
    });
  }

  if (!annualPrice) {
    annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 7899, // R$ 78,99
      currency: "brl",
      recurring: { interval: "year" },
    });
  }

  MONTHLY_PRICE_ID = monthlyPrice.id;
  ANNUAL_PRICE_ID = annualPrice.id;

  return { monthly: MONTHLY_PRICE_ID, annual: ANNUAL_PRICE_ID };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const { billing, userId, successUrl, cancelUrl } = await req.json();

    if (!billing || !userId) {
      return new Response(
        JSON.stringify({ error: "billing e userId são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prices = await ensurePrices(stripe);
    const priceId = billing === "annual" ? prices.annual : prices.monthly;

    const origin = req.headers.get("origin") || "https://readdy.ai";
    const finalSuccessUrl = successUrl || `${origin}/app?payment=success`;
    const finalCancelUrl = cancelUrl || `${origin}/#pricing`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${finalSuccessUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: finalCancelUrl,
      metadata: {
        userId,
        billing,
      },
      subscription_data: {
        metadata: {
          userId,
          billing,
        },
      },
      locale: "pt-BR",
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

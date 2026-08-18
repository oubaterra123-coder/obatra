import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";
const PRO_PRICE = "19.00";
const PRO_CURRENCY = "USD";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anon key is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing");
  }

  const auth = Buffer.from(
    clientId + ":" + clientSecret
  ).toString("base64");

  const response = await fetch(
    PAYPAL_BASE_URL + "/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      "PayPal auth failed: " + errorText
    );
  }

  const data = await response.json();

  return data.access_token;
}

export async function POST(request: Request) {
  try {
    // =========================================
    // 1. GET AUTHENTICATED USER
    // =========================================

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken = authorization.substring(7);

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      console.error(
        "SUPABASE AUTH ERROR:",
        userError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired authentication session.",
        },
        { status: 401 }
      );
    }

    console.log(
      "PAYPAL CAPTURE USER:",
      user.id
    );

    // =========================================
    // 2. READ ORDER ID
    // =========================================

    const body = await request.json();
    const orderID = body?.orderID;

    if (
      !orderID ||
      typeof orderID !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "orderID is required",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 3. PAYPAL ACCESS TOKEN
    // =========================================

    const paypalToken =
      await getPayPalAccessToken();

    // =========================================
    // 4. CAPTURE PAYPAL ORDER
    // =========================================

    const response = await fetch(
      PAYPAL_BASE_URL +
        "/v2/checkout/orders/" +
        encodeURIComponent(orderID) +
        "/capture",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer " + paypalToken,
          "Content-Type":
            "application/json",
          "PayPal-Request-Id":
            `capture-${orderID}`,
          Prefer:
            "return=representation",
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    console.log(
      "PAYPAL CAPTURE RESPONSE:",
      data
    );

    // =========================================
    // 5. PAYPAL ERROR
    // =========================================

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to capture PayPal order",
          orderID,
          details: data,
        },
        { status: response.status }
      );
    }

    // =========================================
    // 6. VERIFY ORDER STATUS
    // =========================================

    if (data.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "PayPal payment was not completed.",
          orderID: data.id,
          status: data.status,
        },
        { status: 402 }
      );
    }

    // =========================================
    // 7. GET CAPTURE DETAILS
    // =========================================

    const capture =
      data.purchase_units?.[0]?.payments
        ?.captures?.[0];

    if (!capture) {
      console.error(
        "PAYPAL CAPTURE DETAILS MISSING:",
        data
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "PayPal capture details are missing.",
          orderID: data.id,
        },
        { status: 402 }
      );
    }

    // =========================================
    // 8. VERIFY CAPTURE STATUS
    // =========================================

    if (capture.status !== "COMPLETED") {
      console.error(
        "PAYPAL CAPTURE STATUS:",
        capture.status
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "PayPal capture was not completed.",
          orderID: data.id,
          status: capture.status,
        },
        { status: 402 }
      );
    }

    // =========================================
    // 9. VERIFY AMOUNT
    // =========================================

    const amount =
      capture.amount?.value;

    const currency =
      capture.amount?.currency_code;

    console.log(
      "PAYPAL PAYMENT CHECK:",
      {
        amount,
        currency,
      }
    );

    if (
      amount !== PRO_PRICE ||
      currency !== PRO_CURRENCY
    ) {
      console.error(
        "PAYPAL AMOUNT VALIDATION FAILED:",
        {
          expectedAmount: PRO_PRICE,
          expectedCurrency: PRO_CURRENCY,
          receivedAmount: amount,
          receivedCurrency: currency,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount or currency is invalid.",
          orderID: data.id,
        },
        { status: 402 }
      );
    }

    // =========================================
    // 10. ACTIVATE PRO
    // =========================================

    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          plan: "pro",
        })
        .eq("id", user.id);

    if (profileError) {
      console.error(
        "PROFILE PLAN UPDATE ERROR:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment completed, but Pro activation failed.",
          orderID: data.id,
        },
        { status: 500 }
      );
    }

    console.log(
      "OBATRA PRO ACTIVATED:",
      user.id
    );

    // =========================================
    // 11. SUCCESS
    // =========================================

    return NextResponse.json({
      success: true,
      orderID: data.id,
      status: data.status,
      plan: "pro",
      amount,
      currency,
    });
  } catch (error) {
    console.error(
      "PAYPAL CAPTURE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown PayPal capture error",
      },
      { status: 500 }
    );
  }
}

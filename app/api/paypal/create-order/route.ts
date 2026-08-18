import { NextResponse } from "next/server";

const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing");
  }

  const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");

  const response = await fetch(PAYPAL_BASE_URL + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("PayPal auth failed: " + errorText);
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST() {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(PAYPAL_BASE_URL + "/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "19.00",
            },
            description: "Obatra Pro - Monthly Subscription",
          },
        ],
        application_context: {
          brand_name: "Obatra",
          user_action: "PAY_NOW",
          return_url: "http://localhost:3001/dashboard/settings/pro/success",
          cancel_url: "http://localhost:3001/dashboard/settings/pro/cancel",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PAYPAL CREATE ORDER ERROR:", data);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create PayPal order",
          details: data,
        },
        { status: response.status }
      );
    }

    const approveLink = data.links?.find(
      (link: { rel?: string; href?: string }) => link.rel === "approve"
    );

    return NextResponse.json({
      success: true,
      orderID: data.id,
      approveUrl: approveLink?.href || null,
    });
  } catch (error) {
    console.error("PAYPAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown PayPal error",
      },
      { status: 500 }
    );
  }
}

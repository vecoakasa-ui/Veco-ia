import { NextRequest, NextResponse } from 'next/server';
import { isPayDunyaConfigured } from '@/lib/paydunya';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planName, price, isYearly } = body;

    if (!planName || !price) {
      return NextResponse.json(
        { error: "Paramètres de plan ou de prix manquants." },
        { status: 400 }
      );
    }

    const { origin } = new URL(request.url);
    const cancelUrl = `${origin}/abonnement/cancel`;
    const returnUrl = `${origin}/abonnement/success?plan=${planName}`;

    const isConfigured = isPayDunyaConfigured();

    if (!isConfigured) {
      // Return mock URL
      const mockToken = 'mock_tok_sub_' + Math.random().toString(36).substring(2, 15);
      return NextResponse.json({
        token: mockToken,
        url: `/abonnement?mock_token=${mockToken}&plan=${planName}&price=${price}`,
        isMock: true
      });
    }

    const apiBaseUrl = 'https://app.paydunya.com/api/v1';

    const payload = {
      invoice: {
        items: {
          item_0: {
            name: `Abonnement Venance Imo - Plan ${planName.toUpperCase()} (${isYearly ? 'Annuel' : 'Mensuel'})`,
            quantity: 1,
            unit_price: price,
            total_price: price
          }
        },
        total_amount: price,
        description: `Souscription au Plan ${planName.toUpperCase()} de la plateforme Venance Imo`
      },
      store: {
        name: "Venance Imo"
      },
      actions: {
        cancel_url: cancelUrl,
        return_url: returnUrl
      }
    };

    const response = await fetch(`${apiBaseUrl}/checkout-invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || ''
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayDunya Subscription creation responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.response_code === '00') {
      return NextResponse.json({
        token: data.token,
        url: data.response_text || data.url,
        isMock: false
      });
    } else {
      return NextResponse.json(
        { error: data.response_text || "Erreur lors de la création de la facture d'abonnement PayDunya." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in PayDunya subscription route:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

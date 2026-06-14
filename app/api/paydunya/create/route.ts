import { NextRequest, NextResponse } from 'next/server';
import { createPayDunyaInvoice } from '@/lib/paydunya';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, tenantName, propertyName, month, year, amount } = body;

    if (!paymentId || !tenantName || !propertyName || !amount) {
      return NextResponse.json(
        { error: "Paramètres d'initiation manquants." },
        { status: 400 }
      );
    }

    const { origin } = new URL(request.url);
    const cancelUrl = `${origin}/pay/${paymentId}/cancel`;
    const returnUrl = `${origin}/pay/${paymentId}/success`;

    const result = await createPayDunyaInvoice({
      paymentId,
      tenantName,
      propertyName,
      month,
      year: year || new Date().getFullYear(),
      amount,
      cancelUrl,
      returnUrl
    });

    if (result.success) {
      return NextResponse.json({
        token: result.token,
        url: result.url,
        isMock: result.isMock
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Une erreur est survenue lors de la création de la facture." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in PayDunya create route:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

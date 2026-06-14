import { NextRequest, NextResponse } from 'next/server';
import { verifyPayDunyaPayment } from '@/lib/paydunya';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Token de transaction manquant." },
        { status: 400 }
      );
    }

    const result = await verifyPayDunyaPayment(token);

    if (result.success) {
      return NextResponse.json({
        status: result.status,
        amount: result.amount,
        paymentMethod: result.paymentMethod,
        isMock: result.isMock
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Impossible de vérifier le paiement." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in PayDunya verify route:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

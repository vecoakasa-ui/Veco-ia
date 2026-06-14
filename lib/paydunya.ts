// ============================================
// VENANCE IMO — PayDunya Integration Utility
// ============================================

export interface PayDunyaInvoiceInput {
  paymentId: string;
  tenantName: string;
  propertyName: string;
  month: string;
  year: number;
  amount: number;
  cancelUrl: string;
  returnUrl: string;
}

export interface PayDunyaInvoiceOutput {
  success: boolean;
  token?: string;
  url?: string;
  error?: string;
  isMock: boolean;
}

export interface PayDunyaVerificationOutput {
  success: boolean;
  status?: 'completed' | 'pending' | 'cancelled';
  amount?: number;
  paymentMethod?: string;
  isMock: boolean;
  error?: string;
}

/**
 * Checks if PayDunya API keys are configured and valid (not default placeholders)
 */
export function isPayDunyaConfigured(): boolean {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;

  return !!(
    masterKey && masterKey !== 'inserez_votre_master_key_ici' &&
    privateKey && privateKey !== 'inserez_votre_test_private_key_ici' &&
    token && token !== 'inserez_votre_test_token_ici'
  );
}

/**
 * Create a checkout invoice on PayDunya
 */
export async function createPayDunyaInvoice(input: PayDunyaInvoiceInput): Promise<PayDunyaInvoiceOutput> {
  const isConfigured = isPayDunyaConfigured();

  if (!isConfigured) {
    console.warn("PayDunya is not configured or using placeholders. Returning mock session.");
    // Generate a mock checkout session
    const mockToken = 'mock_tok_' + Math.random().toString(36).substring(2, 15);
    return {
      success: true,
      token: mockToken,
      url: `/pay/${input.paymentId}?mock_token=${mockToken}`, // Redirect to local mock checkout page
      isMock: true
    };
  }
  const apiBaseUrl = 'https://app.paydunya.com/api/v1';

  try {
    const payload = {
      invoice: {
        items: {
          item_0: {
            name: `Loyer ${input.month} ${input.year} - ${input.propertyName}`,
            quantity: 1,
            unit_price: input.amount,
            total_price: input.amount
          }
        },
        total_amount: input.amount,
        description: `Règlement de loyer pour ${input.tenantName} (${input.propertyName})`
      },
      store: {
        name: "Venance Imo"
      },
      actions: {
        cancel_url: input.cancelUrl,
        return_url: input.returnUrl
      },
      custom_data: {
        payment_id: input.paymentId
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
      throw new Error(`PayDunya API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.response_code === '00') {
      return {
        success: true,
        token: data.token,
        url: data.response_text || data.url, // Redirect URL is in 'url' (or sometimes 'response_text' in older APIs)
        isMock: false
      };
    } else {
      return {
        success: false,
        error: data.response_text || "Erreur inconnue lors de la création de la facture PayDunya.",
        isMock: false
      };
    }
  } catch (error) {
    console.error("Failed to create PayDunya invoice:", error);
    return {
      success: false,
      error: (error as Error).message || "Impossible de se connecter aux serveurs de PayDunya.",
      isMock: false
    };
  }
}

/**
 * Confirm / verify payment status using transaction token
 */
export async function verifyPayDunyaPayment(token: string): Promise<PayDunyaVerificationOutput> {
  // If it's a mock token, resolve positively
  if (token.startsWith('mock_tok_')) {
    return {
      success: true,
      status: 'completed',
      amount: 0,
      paymentMethod: 'wave', // Default mock method
      isMock: true
    };
  }

  const isConfigured = isPayDunyaConfigured();
  if (!isConfigured) {
    return {
      success: false,
      error: "PayDunya n'est pas configuré.",
      isMock: true
    };
  }

  const apiBaseUrl = 'https://app.paydunya.com/api/v1';

  try {
    const response = await fetch(`${apiBaseUrl}/checkout-invoice/confirm/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayDunya API confirmation status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.response_code === '00' || data.status === 'completed') {
      return {
        success: true,
        status: data.status as 'completed' | 'pending' | 'cancelled',
        amount: data.invoice?.total_amount || 0,
        paymentMethod: data.custom_data?.payment_method || 'paydunya',
        isMock: false
      };
    } else {
      return {
        success: true,
        status: data.status || 'pending',
        amount: data.invoice?.total_amount || 0,
        isMock: false,
        error: data.response_text
      };
    }
  } catch (error) {
    console.error("Failed to verify PayDunya payment:", error);
    return {
      success: false,
      error: (error as Error).message || "Échec de vérification du statut du paiement auprès de PayDunya.",
      isMock: false
    };
  }
}

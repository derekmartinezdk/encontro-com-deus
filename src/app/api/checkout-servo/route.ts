import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paymentData, ...userData } = body;

        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
        const payment = new Payment(client);

        console.log("=== PROCESSANDO PAGAMENTO SERVO ===");

        let paymentResponse;
        try {
            paymentResponse = await payment.create({
                body: {
                    transaction_amount: Number(paymentData.transaction_amount || 120),
                    description: paymentData.description || 'Inscrição Encontro - Servo',
                    installments: paymentData.installments,
                    payment_method_id: paymentData.payment_method_id,
                    issuer_id: paymentData.issuer_id,
                    token: paymentData.token, // se for cartao de credito
                    payer: {
                        ...paymentData.payer,
                        email: paymentData.payer?.email || userData.email, // Pega o e-mail real enviado do form
                    }
                }
            });
        } catch (mpError) {
            console.error("Erro ao criar pagamento no MercadoPago:", mpError);
            return NextResponse.json({ error: 'Falha gravíssima ao registrar requisição na provedora (Mercado Pago)', details: mpError }, { status: 500 });
        }

        const insertPayload = {
            tipo_inscricao: "SERVO",
            nome_completo: userData.nome || "",
            email: userData.email || null,
            idade: userData.idade ? parseInt(userData.idade) : null,
            sexo: userData.sexo || null,
            funcao_igreja: userData.funcao || null,
            rede: userData.rede || null,
            discipulador: userData.discipulador || null,
            fez_ctl: userData.ctl || null,
            fez_maturidade: userData.maturidade || null,
            txid: paymentResponse.id?.toString() || null,
            status_pagamento: "pendente",
            qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code || null,
            valor: 120
        };

        if (paymentData.payment_method_id === 'pix') {
            insertPayload.status_pagamento = 'pendente';
        } else {
            if (paymentResponse.status === 'approved') {
                insertPayload.status_pagamento = 'pago';
            } else {
                return NextResponse.json({ error: 'Pagamento recusado', status: paymentResponse.status }, { status: 400 });
            }
        }

        const { data: dbData, error: dbError } = await supabase
            .from('inscricoes_servos')
            .insert([insertPayload])
            .select()
            .single();

        if (dbError) {
            console.error("Erro detalhado ao salvar no banco:", dbError?.message || JSON.stringify(dbError));
            return NextResponse.json({ error: 'Erro ao salvar inscrição no banco de dados', details: dbError }, { status: 500 });
        }

        return NextResponse.json({ 
            status: paymentResponse.status,
            id: paymentResponse.id,
            qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code || null
        }, { status: 200 });

    } catch (error: any) {
        console.error("ERRO COMPLETO NO BACKEND:", error);
        
        // Extraindo a mensagem real, seja do Supabase ou do Mercado Pago
        const errorMessage = error?.message || "Erro desconhecido";
        const errorDetails = error?.response || error?.details || error;

        return NextResponse.json(
            { 
                error: "Erro interno ao processar pagamento", 
                details: errorDetails,
                message: errorMessage
            }, 
            { status: 500 }
        );
    }
}

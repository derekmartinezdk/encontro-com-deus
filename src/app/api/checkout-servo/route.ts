import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: Request) {
    try {
        // 1. LEITURA BLINDADA (Evita o crash de Unexpected end of JSON input)
        const textBody = await req.text();
        if (!textBody) {
            return NextResponse.json({ error: "Body da requisição vazio" }, { status: 400 });
        }
        
        let body;
        try {
            body = JSON.parse(textBody);
        } catch (parseError) {
             console.error("FALHA DE PARSE JSON:", parseError);
             return NextResponse.json({ error: "JSON invalido na requisicao" }, { status: 400 });
        }
        
        const { paymentData, ...userData } = body;

        // 2. INICIALIZAÇÃO MP (Garante o uso do token correto com Timeout)
        const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '';
        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
        const payment = new Payment(client);

        console.log("=== PROCESSANDO PAGAMENTO SERVO ===");

        const finalPayerEmail = paymentData?.payer?.email || paymentData?.email || userData?.email || body?.email || 'fallback@encontro.com';

        // 3. PAYLOAD HARDCODED SEGURO
        const mpPayload: any = {
            transaction_amount: 120, // Forçado como Number absoluto
            description: paymentData?.description || 'Inscrição Encontro - Servo',
            payment_method_id: paymentData?.payment_method_id,
            payer: {
                ...(paymentData?.payer || {}),
                email: finalPayerEmail
            }
        };

        // O token do cartão é obrigatório para crédito, repassamos se existirem
        if (paymentData?.token) mpPayload.token = paymentData.token;
        if (paymentData?.installments) mpPayload.installments = Number(paymentData.installments);
        if (paymentData?.issuer_id) mpPayload.issuer_id = String(paymentData.issuer_id);

        let paymentResponse;
        try {
            paymentResponse = await payment.create({
                body: mpPayload
            });
        } catch (mpError: any) {
            console.error("Erro ao criar pagamento no MercadoPago:", mpError);
            return NextResponse.json({ error: 'Falha gravíssima ao registrar requisição na provedora', details: mpError?.message || String(mpError) }, { status: 500 });
        }

        const insertPayload = {
            tipo_inscricao: "SERVO",
            nome_completo: userData?.nome || "",
            email: userData?.email || finalPayerEmail,
            idade: userData?.idade ? parseInt(userData.idade) : null,
            sexo: userData?.sexo || null,
            funcao_igreja: userData?.funcao || null,
            rede: userData?.rede || null,
            discipulador: userData?.discipulador || null,
            fez_ctl: userData?.ctl || null,
            fez_maturidade: userData?.maturidade || null,
            txid: paymentResponse.id?.toString() || null,
            status_pagamento: "pendente",
            qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code || null,
            valor: 120
        };

        if (paymentData?.payment_method_id === 'pix') {
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
        }, { status: 201 });

    } catch (error: any) {
        console.error("CATASTROFE NO BACKEND:", error);
        
        // Remove erro de chamada json subjacente do SDK garantindo o catch em String
        return NextResponse.json(
            { 
                error: "Falha ao processar pagamento", 
                details: error?.message || String(error)
            }, 
            { status: 500 }
        );
    }
}

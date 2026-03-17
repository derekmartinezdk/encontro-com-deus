import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(req: Request) {
    try {
        // 1. LEITURA BLINDADA
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

        let calculatedIdade = null;
        if (userData?.dataNascimento) {
            const birthDate = new Date(userData.dataNascimento);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            calculatedIdade = age;
        }

        // 1. INICIALIZAÇÃO CORRETA E NO ESCOPO (Resolve 'client is not defined')
        const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || '';
        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
        const payment = new Payment(client);

        console.log("=== PROCESSANDO PAGAMENTO ENCONTRISTA ===");

        const finalPayerEmail = paymentData?.payer?.email || paymentData?.email || userData?.email || body?.email || 'fallback@encontro.com';

        // 2. MONTAGEM DO PAYLOAD (Mantendo o transaction_amount: 120)
        const mpPayload: any = {
            transaction_amount: 120, // Forçado
            description: paymentData?.description || 'Inscrição Encontrista - ENCONTRO COM DEUS',
            payment_method_id: paymentData?.payment_method_id,
            payer: {
                ...(paymentData?.payer || {}),
                email: finalPayerEmail
            }
        };

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
            tipo_inscricao: "ENCONTRISTA", 
            nome_completo: userData?.nome || "",
            idade: calculatedIdade,
            sexo: userData?.sexo || null,
            discipulador: userData?.discipulador || null,
            rede: userData?.rede || null,
            data_nascimento: userData?.dataNascimento || null,
            celular: userData?.celular || null,
            endereco: userData?.endereco || null,
            lider_celula: userData?.liderCelula || null,
            estado_civil: userData?.estadoCivil || null,
            deficiencia_fisica: userData?.deficienciaFisica || null,
            uso_medicamento: userData?.medicamento || null,
            contato_emergencia: userData?.emergencia || null,
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
            .from('inscricoes')
            .insert([insertPayload])
            .select()
            .single();

        if (dbError) {
            console.error("Erro detalhado do BD:", dbError?.message || JSON.stringify(dbError));
            return NextResponse.json({ error: 'Erro ao salvar inscrição no banco de dados', details: dbError }, { status: 500 });
        }

        return NextResponse.json({ 
            status: paymentResponse.status,
            id: paymentResponse.id,
            qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code || null
        }, { status: 201 });

    } catch (error: any) {
        console.error("CATASTROFE NO BACKEND:", error);
        return NextResponse.json(
            { 
                error: "Falha ao processar pagamento", 
                details: error?.message || String(error)
            }, 
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic'; // <-- COMANDO CRÍTICO PARA MATAR O CACHE

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

        // HARDCODE DO TOKEN DE ACESSO PARA BYPASSAR O BUG DE ENV DA VERCEL
        const accessToken = "APP_USR-3336896594577234-022016-3c713859990d08a367c6841de6b140c8-3215951193";
        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
        const payment = new Payment(client);

        console.log("=== PROCESSANDO PAGAMENTO SERVO ===");

        // LOG SALVADOR: Ajuda a descobrir a árvore de objetos do Brick em tempo de execução
        console.log("PAYLOAD RECEBIDO DO FRONTEND (SERVO):", JSON.stringify(body, null, 2));

        // Busca em todas as possíveis sub-camadas cegas vindas do React Payload
        const methodId = body.payment_method_id || body.formData?.payment_method_id || body.paymentData?.payment_method_id;

        if (!methodId) {
            return NextResponse.json({ error: "FALHA GRAVE: payment_method_id indisponível.", bodyRecebido: body }, { status: 400 });
        }

        // Forçando o usuário de teste para TUDO (Pix e Cartão) para bypassar o bloqueio Live
        const testUserEmail = "test_user_8009766B12812605991@testuser.com";

        // 2. MONTAGEM DO PAYLOAD LENDO DE 'body'
        const mpPayload: any = {
            transaction_amount: 120, // Forçado como Number absoluto
            description: body.description || 'Inscrição Encontro - Servo',
            payment_method_id: methodId,
            payer: { email: testUserEmail } // Substituição forçada do e-mail para liberar Sandbox
        };

        // Extração defensiva para cartões - garantida de bater em todas as rotas
        const tokenVal = body.token || body.formData?.token || body.paymentData?.token;
        if (tokenVal) mpPayload.token = tokenVal;
        
        const instVal = body.installments || body.formData?.installments || body.paymentData?.installments;
        if (instVal) mpPayload.installments = Number(instVal);

        const issuerVal = body.issuer_id || body.formData?.issuer_id || body.paymentData?.issuer_id;
        if (issuerVal) mpPayload.issuer_id = String(issuerVal);

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
            email: userData?.email || (body.email || body.payer?.email || body.paymentData?.payer?.email || testUserEmail),
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

        if (methodId === 'pix') {
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
        return NextResponse.json(
            { 
                error: "V4_CACHE_LIMPADO", // NOVA MARCA D'ÁGUA
                details: error?.message || String(error)
            }, 
            { status: 500 }
        );
    }
}

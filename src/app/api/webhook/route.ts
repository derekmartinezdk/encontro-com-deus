import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("=== WEBHOOK MERCADO PAGO RECEBIDO ===", JSON.stringify(body, null, 2));

        // Pela documentação do MP, recebemos action='payment.updated' e data.id
        const action = body.action || body.topic;
        const paymentId = body.data?.id || body.resource;

        if (!paymentId || (action !== 'payment.updated' && action !== 'payment.created')) {
            console.warn("Webhook ignorado: Formato não reconhecido ou irrelevante.");
            return NextResponse.json({ message: 'Ignorado' }, { status: 200 });
        }

        // Consultando o status atual na API do Mercado Pago por segurança
        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
        const payment = new Payment(client);
        
        const paymentInfo = await payment.get({ id: paymentId });
        const status = paymentInfo.status;

        console.log(`Verificando pagamento ${paymentId}. Status: ${status}`);

        let statusParaSalvar = 'pendente';
        if (status === 'approved') {
            statusParaSalvar = 'pago';
        } else if (status === 'rejected' || status === 'cancelled') {
            statusParaSalvar = 'cancelado';
        }

        const txid = paymentId.toString();

        // 1. Tenta atualizar na tabela de Encontristas
        const { data: updateInscricoes, error: errorInscricoes } = await supabase
            .from('inscricoes')
            .update({ status_pagamento: statusParaSalvar })
            .eq('txid', txid)
            .select();

        let foiAtualizado = false;

        if (!errorInscricoes && updateInscricoes && updateInscricoes.length > 0) {
            console.log(`[Sucesso] Inscrição Encontrista (txid: ${txid}) atualizada para ${statusParaSalvar}!`);
            foiAtualizado = true;
        }

        // 2. Se não encontrou na tabela inscricoes, tenta na tabela inscricoes_servos
        if (!foiAtualizado) {
            const { data: updateServos, error: errorServos } = await supabase
                .from('inscricoes_servos')
                .update({ status_pagamento: statusParaSalvar })
                .eq('txid', txid)
                .select();

            if (!errorServos && updateServos && updateServos.length > 0) {
                console.log(`[Sucesso] Inscrição Servo (txid: ${txid}) atualizada para ${statusParaSalvar}!`);
                foiAtualizado = true;
            } else if (errorServos) {
                console.error("Erro ao tentar atualizar tabela inscricoes_servos:", errorServos);
            }
        }

        if (!foiAtualizado) {
            console.warn(`[Aviso] Nenhum registro encontrado com o txid: ${txid}.`);
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Erro interno ao processar webhook:", error);
        return NextResponse.json({ success: false, message: 'Erro interno' }, { status: 200 });
    }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("=== WEBHOOK RECEBIDO ===", JSON.stringify(body, null, 2));

        // Extrai o identificador da transação e do status do payload
        // Cobrimos as estruturas mais comuns de webhooks de pagamento (como InfinitePay, etc)
        const txid = body.id || body.payment?.id || body.data?.id || body.resource?.id;
        const status = body.status || body.payment?.status || body.data?.status || 'pago';

        if (!txid) {
            console.warn("Nenhum txid ou id encontrado no webhook.");
            // Retorna 200 para evitar que o gateway fique repolling
            return NextResponse.json({ message: 'Webhook ignorado (sem txid)' }, { status: 200 });
        }

        // Mapeando o status recebido para o nosso padrão de banco de dados
        let statusParaSalvar = 'pendente';
        if (typeof status === 'string') {
            const s = status.toLowerCase();
            // Status comuns que indicam sucesso
            if (s === 'paid' || s === 'approved' || s === 'pago' || s === 'aprovado' || s === 'settled') {
                statusParaSalvar = 'pago';
            } 
            // Status comuns de recusa/cancelamento
            else if (s === 'refused' || s === 'declined' || s === 'canceled' || s === 'cancelled' || s === 'expired' || s === 'cancelado') {
                statusParaSalvar = 'cancelado';
            } 
            // Status pendente/processando
            else if (s === 'processing' || s === 'pending' || s === 'pendente') {
                statusParaSalvar = 'pendente';
            } 
            // Fallback (salvar o que vier se desconhecido)
            else {
                statusParaSalvar = status;
            }
        }

        console.log(`Processando webhook para txid: ${txid} | Novo Status: ${statusParaSalvar}`);

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
            console.warn(`[Aviso] Nenhum registro encontrado com o txid: ${txid} nas tabelas de inscricoes e inscricoes_servos.`);
        }

        // Sempre retornar 200 OK imediato para que o gateway saiba que foi recebido com sucesso
        return NextResponse.json({ success: true, message: 'Recebido com sucesso' }, { status: 200 });

    } catch (error) {
        console.error("Erro interno ao processar webhook:", error);
        // Continua retornando um status 200 / ou deixamos dar erro pro gateway retentar
        // A especificação pede HTTP 200 imediato
        return NextResponse.json({ success: false, message: 'Erro interno, mas recebido' }, { status: 200 });
    }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("=== SALVANDO SERVO NO BANCO DE DADOS ===");

        // Mapeando para as colunas do banco de dados (Apenas campos de Servos + Sistema)
        const insertPayload = {
            tipo_inscricao: "SERVO",
            nome_completo: body.nome || "",
            idade: body.idade ? parseInt(body.idade) : null,
            sexo: body.sexo || null,
            funcao_igreja: body.funcao || null,
            rede: body.rede || null,
            fez_ctl: body.ctl || null,
            fez_maturidade: body.maturidade || null,
            // Campos de sistema / pagamento (de acordo com instruções)
            txid: null,
            status_pagamento: "pendente",
            qr_code: null,
            valor: 120 // Valor oficial (R$ 120,00)
        };

        const { data: dbData, error: dbError } = await supabase
            .from('inscricoes_servos')
            .insert([insertPayload])
            .select()
            .single();

        if (dbError) {
            console.error("Erro detalhado ao salvar no banco:", dbError?.message || JSON.stringify(dbError));
            return NextResponse.json({ error: 'Erro ao salvar inscrição no banco de dados', details: dbError }, { status: 500 });
        }

        const servoId = dbData.id;

        // Faz a requisição nativa para a InfinitePay
        console.log("Iniciando requisição para InfinitePay...");

        const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                handle: 'derekmartinezdk',
                redirect_url: 'https://encontro-com-deus-eldorado-ibi.vercel.app/sucesso',
                items: [
                    {
                        quantity: 1,
                        price: 12000, // Preço oficial R$ 120,00
                        description: 'Inscrição Servo - ENCONTRO COM DEUS'
                    }
                ],
                // Passar o ID do pedido como metadata, caso a API suporte, ou gerar nosso txid
                metadata: {
                    id_inscricao: servoId,
                    tipo: "SERVO"
                }
            })
        });

        const data = await response.json();

        // Log para debug
        console.log("Resposta bruta da InfinitePay:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("Erro na InfinitePay:", data);
            // Poderíamos deletar a linha no banco aqui, ou apenas marcar como erro
            return NextResponse.json({ error: 'Erro ao gerar pagamento na InfinitePay', details: data }, { status: response.status });
        }

        // Obtém a URL do pagamento
        const paymentUrl = data.url || data.link || (data.data && data.data.url) || null;

        // Se a Infinite Pay retornar o ID da transação, atualizamos no banco
        // Considerando que data.id seja o "txid" da InfinitePay
        if (data.id) {
            const { error: updateError } = await supabase
                .from('inscricoes_servos')
                .update({ txid: data.id })
                .eq('id', servoId);

            if (updateError) {
                console.error("Erro ao atualizar txid no banco:", updateError);
            }
        }

        return NextResponse.json({ init_point: paymentUrl }, { status: 200 });
    } catch (error) {
        console.error("Erro no servidor ao tentar processar checkout de servo:", error);
        return NextResponse.json({ error: 'Erro interno ao tentar processar checkout' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        let calculatedIdade = null;
        if (body.dataNascimento) {
            const birthDate = new Date(body.dataNascimento);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            calculatedIdade = age;
        }

        console.log("=== SALVANDO ENCONTRISTA NO BANCO DE DADOS ===");

        // Mapeando para as colunas do banco de dados
        const insertPayload = {
            tipo_inscricao: "ENCONTRISTA", // Forçando ENCONTRISTA nesta rota
            nome_completo: body.nome || "",
            idade: calculatedIdade, // Calculada automaticamente
            sexo: body.sexo || null,
            discipulador: body.discipulador || null,
            rede: body.rede || null,
            data_nascimento: body.dataNascimento || null,
            celular: body.celular || null,
            endereco: body.endereco || null,
            lider_celula: body.liderCelula || null,
            estado_civil: body.estadoCivil || null,
            deficiencia_fisica: body.deficienciaFisica || null,
            uso_medicamento: body.medicamento || null, // alterado de medicamento para uso_medicamento para adequar ao schema
            contato_emergencia: body.emergencia || null,
            txid: null,
            status_pagamento: "pendente",
            qr_code: null,
            valor: 120
        };

        const { data: dbData, error: dbError } = await supabase
            .from('inscricoes')
            .insert([insertPayload])
            .select()
            .single();

        if (dbError) {
            console.error("Erro detalhado:", dbError?.message || JSON.stringify(dbError));
            return NextResponse.json({ error: 'Erro ao salvar inscrição no banco de dados', details: dbError }, { status: 500 });
        }

        const inscricaoId = dbData.id;

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
                        description: 'Inscrição Encontrista - ENCONTRO COM DEUS'
                    }
                ],
                metadata: {
                    id_inscricao: inscricaoId,
                    tipo: "ENCONTRISTA"
                }
            })
        });

        const data = await response.json();

        // Log para debug
        console.log("Resposta bruta da InfinitePay:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("Erro na InfinitePay:", data);
            return NextResponse.json({ error: 'Erro ao gerar pagamento na InfinitePay', details: data }, { status: response.status });
        }

        const paymentUrl = data.url || data.link || (data.data && data.data.url) || null;

        // Se a Infinite Pay retornar o ID da transação, atualizamos no banco
        if (data.id) {
            const { error: updateError } = await supabase
                .from('inscricoes')
                .update({ txid: data.id })
                .eq('id', inscricaoId);

            if (updateError) {
                console.error("Erro ao atualizar txid no banco:", updateError);
            }
        }

        return NextResponse.json({ init_point: paymentUrl }, { status: 200 });
    } catch (error) {
        console.error("Erro no servidor ao tentar gerar checkout:", error);
        return NextResponse.json({ error: 'Erro interno ao tentar processar checkout' }, { status: 500 });
    }
}

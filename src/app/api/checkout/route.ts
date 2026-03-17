import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paymentData, ...userData } = body;

        let calculatedIdade = null;
        if (userData.dataNascimento) {
            const birthDate = new Date(userData.dataNascimento);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            calculatedIdade = age;
        }

        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
        const payment = new Payment(client);

        console.log("=== PROCESSANDO PAGAMENTO ENCONTRISTA ===");

        const paymentResponse = await payment.create({
            body: {
                transaction_amount: paymentData.transaction_amount,
                token: paymentData.token,
                description: 'Inscrição Encontrista - ENCONTRO COM DEUS',
                installments: paymentData.installments,
                payment_method_id: paymentData.payment_method_id,
                issuer_id: paymentData.issuer_id,
                payer: {
                    email: paymentData.payer.email,
                    identification: paymentData.payer.identification
                }
            }
        });

        const insertPayload = {
            tipo_inscricao: "ENCONTRISTA", 
            nome_completo: userData.nome || "",
            idade: calculatedIdade,
            sexo: userData.sexo || null,
            discipulador: userData.discipulador || null,
            rede: userData.rede || null,
            data_nascimento: userData.dataNascimento || null,
            celular: userData.celular || null,
            endereco: userData.endereco || null,
            lider_celula: userData.liderCelula || null,
            estado_civil: userData.estadoCivil || null,
            deficiencia_fisica: userData.deficienciaFisica || null,
            uso_medicamento: userData.medicamento || null,
            contato_emergencia: userData.emergencia || null,
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
                // Não salva no banco se o cartão foi recusado
                return NextResponse.json({ error: 'Pagamento recusado', status: paymentResponse.status }, { status: 400 });
            }
        }

        const { data: dbData, error: dbError } = await supabase
            .from('inscricoes')
            .insert([insertPayload])
            .select()
            .single();

        if (dbError) {
            console.error("Erro detalhado:", dbError?.message || JSON.stringify(dbError));
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

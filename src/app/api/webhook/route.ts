import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // O Mercado Pago exige que retornemos 200 OK rapidamente. 
    // Ignora qualquer evento que não seja notificação de pagamento.
    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
    }

    // 1. CHAMA O MERCADO PAGO PARA VERIFICAR A VERACIDADE DO PAGAMENTO (Segurança)
    const accessToken = process.env.MP_ACCESS_TOKEN || "TEST-7398472344012829-031717-871a9f9740d68277590af0ea764b1b99-140768825";
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
    const payment = new Payment(client);
    
    const paymentData = await payment.get({ id: body.data.id });
    
    const status = paymentData.status; 
    
    // Extração Agressiva do E-mail
    const payerEmail = 
      paymentData.payer?.email || 
      paymentData.additional_info?.payer?.first_name || 
      (paymentData.metadata && paymentData.metadata.email) || null;

    if (!payerEmail) {
      // LOG SALVADOR: Se não achar, imprime o objeto inteiro para debugar
      console.error(`Webhook - Falha ao extrair e-mail do pagamento ${body.data.id}. Payload MP:`, JSON.stringify(paymentData, null, 2));
      return NextResponse.json({ message: "Sem email" }, { status: 200 });
    }

    // 2. ATUALIZA O SUPABASE
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Idealmente usar Service Role em APIs
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Atualiza a tabela de servos (Altere 'inscricoes_servos' e 'status_pagamento' se os nomes das colunas forem diferentes no seu DB)
      const { error } = await supabase
        .from('inscricoes_servos')
        .update({ status_pagamento: status }) // Coluna que guarda se tá pago ou não
        .eq('email', payerEmail); 

      if (error) {
        console.error("Erro ao atualizar Supabase via Webhook:", error);
      } else {
        console.log(`Webhook: Status do e-mail ${payerEmail} atualizado para ${status} no Supabase.`);
      }
    } else {
      console.warn("Supabase Keys ausentes no ENV. Webhook processado mas DB não atualizado.");
    }

    // Sempre retornar 200 pro MP parar de enviar a notificação repetida
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Erro fatal no Webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

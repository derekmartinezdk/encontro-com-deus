import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Faz a requisição nativa para a InfinitePay
        console.log("Iniciando requisição para InfinitePay...");

        const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                handle: 'derekmartinezdk',
                redirect_url: 'http://localhost:3000/sucesso',
                items: [
                    {
                        quantity: 1,
                        price: 200,
                        description: 'Inscrição - ENCONTRO COM DEUS'
                    }
                ]
            })
        });

        const data = await response.json();

        // Log para debug
        console.log("Resposta bruta da InfinitePay:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("Erro na InfinitePay:", data);
            return NextResponse.json({ error: 'Erro ao gerar pagamento na InfinitePay', details: data }, { status: response.status });
        }

        // Devolver a URL como init_point para não quebrar o frontend
        // Supondo que a InfinitePay devolva a URL em data.url ou algo parecido
        // Você precisará verificar no console se chama "url" ou "link". Usa-se um fallback para data.url
        const paymentUrl = data.url || data.link || (data.data && data.data.url) || null;

        return NextResponse.json({ init_point: paymentUrl }, { status: 200 });
    } catch (error) {
        console.error("Erro no servidor ao tentar gerar checkout:", error);
        return NextResponse.json({ error: 'Erro interno ao tentar processar checkout' }, { status: 500 });
    }
}

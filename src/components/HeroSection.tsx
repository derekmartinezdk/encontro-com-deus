import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative w-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pt-12 pb-24 md:py-24 text-white overflow-hidden text-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
                <span className="mb-4 inline-block rounded-full bg-blue-100/10 px-4 py-1.5 text-sm font-medium text-blue-100 backdrop-blur-md border border-blue-100/20">
                    Tudo pode mudar em 3 dias, você está a uma decisão de viver algo novo
                </span>
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-sm">
                    ENCONTRO COM DEUS RADICAIS LIVRES
                </h2>
                <div className="flex flex-col md:flex-row gap-6 items-center justify-center text-lg md:text-xl font-medium mb-10 text-blue-100">
                    <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        13, 14 e 15 de Março de 2026
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Valor: R$ 120,00
                    </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-white mb-6 drop-shadow-md">
                    📍 Local: Recanto dos Vencedores
                </p>
                <Link href="/inscricao" className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-blue-900 transition-transform hover:scale-105 hover:shadow-xl active:scale-95">
                    Inscreva-se Agora
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}

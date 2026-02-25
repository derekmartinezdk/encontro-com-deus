import Link from "next/link";
import Header from "@/components/Header";

export default function SucessoPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center transform transition-all hover:scale-105 duration-300 border border-gray-100">

                    {/* Ícone de Sucesso Animado (Check verde) */}
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg className="w-12 h-12 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Inscrição Confirmada! 🎉
                    </h1>

                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                        Sua vaga para o <strong className="text-blue-900 font-semibold">Encontro com Deus</strong> está garantida. Avise seu líder dessa ótima notícia.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 w-full bg-blue-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-500/30 outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para o Início
                    </Link>
                </div>
            </main>

            <footer className="w-full bg-blue-950 py-6 text-center text-blue-200 text-sm">
                <p>© {new Date().getFullYear()} IGREJA BATISTA IMPERIAL. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}

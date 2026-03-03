"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type Step = 1 | 2;
type InscriptionType = "ENCONTRISTA" | "SERVO" | null;

const DISCIPULADORES = [
    "Bruna Paula", "Carlos Daniel", "Derek Martinez", "Fabricio Chaves",
    "Higor Sanches", "João Victor", "Leonardo Ramires", "Valter Junior"
];

export default function InscricaoPage() {
    const [step, setStep] = useState<Step>(1);
    const [type, setType] = useState<InscriptionType>(null);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const handleSelectType = (selectedType: InscriptionType) => {
        setType(selectedType);
        setFormData({}); // Limpar o formulário ao trocar o tipo
        setStep(2);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("=== ENVIANDO DADOS PARA API ===");

            // Define qual endpoint chamar com base no tipo
            const endpoint = type === "SERVO" ? "/api/checkout-servo" : "/api/checkout";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, type }), // Enviando type caso necessário
            });

            const data = await res.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert("Erro ao redirecionar para o pagamento: " + JSON.stringify(data));
                setLoading(false);
            }
        } catch (error) {
            console.error("Erro no formulário:", error);
            alert("Erro ao enviar formulário. Tente novamente.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
            <Header />

            <main className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6">
                <div className="w-full max-w-3xl">

                    {/* Indicador de Passos */}
                    <div className="mb-8 flex justify-center items-center gap-4 text-sm font-semibold">
                        <div className={`flex items-center gap-2 ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</span>
                            <span>Escolha o Tipo</span>
                        </div>
                        <div className="w-12 h-0.5 bg-gray-200"></div>
                        <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</span>
                            <span>Seus Dados</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="fade-in">
                            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Quem é você no Encontro?</h2>
                            <p className="text-center text-gray-500 mb-10">Selecione o tipo de inscrição para continuar</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => handleSelectType("ENCONTRISTA")}
                                    className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 text-left overflow-hidden flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                                >
                                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">INSCRIÇÃO ENCONTRISTA</h3>
                                    <p className="text-gray-500 text-sm">Para você que vai participar do Encontro com Deus como participante.</p>
                                </button>

                                <button
                                    onClick={() => handleSelectType("SERVO")}
                                    className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 text-left overflow-hidden flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                                >
                                    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">INSCRIÇÃO SERVO</h3>
                                    <p className="text-gray-500 text-sm">Para a equipe que vai servir e trabalhar durante o evento.</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && type && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 fade-in">
                            <div className="flex items-center gap-4 mb-8 border-b pb-6">
                                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Formulário de {type === "SERVO" ? "Servo" : "Encontrista"}</h2>
                                    <p className="text-gray-500 text-sm">Preencha com atenção os dados abaixo</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* CAMPOS PARA SERVO */}
                                {type === "SERVO" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo</label>
                                            <input type="text" required onChange={(e) => handleInputChange("nome", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Idade</label>
                                            <input type="number" required min="1" onChange={(e) => handleInputChange("idade", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sexo</label>
                                            <select required onChange={(e) => handleInputChange("sexo", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                                                <option className="text-gray-900" value="">Selecione...</option>
                                                <option className="text-gray-900" value="M">Masculino</option>
                                                <option className="text-gray-900" value="F">Feminino</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Função na Igreja</label>
                                            <select required onChange={(e) => handleInputChange("funcao", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                                                <option className="text-gray-900" value="">Selecione...</option>
                                                <option className="text-gray-900" value="Discipulador">Discipulador(a)</option>
                                                <option className="text-gray-900" value="Lider">Líder</option>
                                                <option className="text-gray-900" value="Lider_Treinamento">Líder em Treinamento</option>
                                                <option className="text-gray-900" value="Membro">Membro</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rede</label>
                                            <select required onChange={(e) => handleInputChange("rede", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                                                <option className="text-gray-900" value="">Selecione...</option>
                                                <option className="text-gray-900" value="Jovens">Jovens</option>
                                                <option className="text-gray-900" value="Teens">Teens</option>
                                                <option className="text-gray-900" value="Familia">Familia</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-semibold text-gray-700">Fez CTL?</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="ctl" value="Sim" required onChange={(e) => handleInputChange("ctl", e.target.value)} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Sim
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="ctl" value="Não" required onChange={(e) => handleInputChange("ctl", e.target.value)} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Não
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-semibold text-gray-700">Fez Maturidade?</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="maturidade" value="Sim" required onChange={(e) => handleInputChange("maturidade", e.target.value)} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Sim
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="maturidade" value="Não" required onChange={(e) => handleInputChange("maturidade", e.target.value)} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Não
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CAMPOS PARA ENCONTRISTA */}
                                {type === "ENCONTRISTA" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo</label>
                                            <input type="text" required onChange={(e) => handleInputChange("nome", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data de Nascimento</label>
                                            <input type="date" required onChange={(e) => handleInputChange("dataNascimento", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Celular / WhatsApp</label>
                                            <input type="tel" required placeholder="(11) 99999-9999" onChange={(e) => handleInputChange("celular", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Endereço (Rua, Número e Bairro)</label>
                                            <input type="text" required onChange={(e) => handleInputChange("endereco", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Líder de Célula</label>
                                            <input type="text" required onChange={(e) => handleInputChange("liderCelula", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discipulador(a)</label>
                                            <select required onChange={(e) => handleInputChange("discipulador", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                                                <option className="text-gray-900" value="">Selecione...</option>
                                                {DISCIPULADORES.map(d => <option className="text-gray-900" key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rede</label>
                                            <select required onChange={(e) => handleInputChange("rede", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                                                <option className="text-gray-900" value="">Selecione...</option>
                                                <option className="text-gray-900" value="Jovens">Jovens</option>
                                                <option className="text-gray-900" value="Teens">Teens</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado Civil</label>
                                            <select required onChange={(e) => handleInputChange("estadoCivil", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                                                <option className="text-gray-900" value="">Selecione...</option>
                                                <option className="text-gray-900" value="Solteiro">Solteiro(a)</option>
                                                <option className="text-gray-900" value="Casado">Casado(a)</option>
                                                <option className="text-gray-900" value="Divorciado">Divorciado(a)</option>
                                                <option className="text-gray-900" value="Viuvo">Viúvo(a)</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-semibold text-gray-700">Sexo</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="sexo" value="Masculino" required onChange={(e) => handleInputChange("sexo", e.target.value)} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Masculino
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="sexo" value="Feminino" required onChange={(e) => handleInputChange("sexo", e.target.value)} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Feminino
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="block text-sm font-semibold text-gray-700">Portador de Deficiência Física?</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="deficiencia" value="Sim" required onChange={(e) => handleInputChange("deficienciaFisica", "Sim")} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Sim
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1 text-gray-900">
                                                    <input type="radio" name="deficiencia" value="Não" required onChange={(e) => handleInputChange("deficienciaFisica", "Não")} className="w-4 h-4 text-gray-900 text-blue-600 focus:ring-blue-500" /> Não
                                                </label>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usuário de Algum medicamento? Qual?</label>
                                            <input type="text" placeholder="Se não, deixe em branco ou responda 'Não'" onChange={(e) => handleInputChange("medicamento", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contato de Emergência (Nome e Celular)</label>
                                            <input type="text" required placeholder="Ex: Maria (11) 99999-9999" onChange={(e) => handleInputChange("emergencia", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>

                                        <div className="md:col-span-2 mt-4 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                            <label className="flex items-start gap-4 cursor-pointer text-gray-900">
                                                <input type="checkbox" required className="w-6 h-6 shrink-0 mt-1 text-gray-900 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                                                <span className="text-sm text-gray-700 leading-relaxed">
                                                    <strong>Declaração de Ciência:</strong> Estou ciente da minha participação no ENCONTRO COM DEUS, promovido pela Igreja Batista Imperial em Células durante os dias 13, 14 e 15 de março de 2026. Durante o período da minha participação me submeterei aos organizadores, as atividades e as normas e horário do evento. Declaro-me ciente também que o valor da inscrição é de R$ 1,00. E estou consciente que este evento é espiritual onde estarei ouvindo e aprendendo a Palavra de Deus através da Bíblia, não haverá atividade de lazer como; piscina, futebol, jogos, etc. - <strong>Ciente: SIM</strong>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t mt-8">
                                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 text-lg flex items-center justify-center gap-2">
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            "Ir para o Pagamento (R$ 1,00)"
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>
                    )}

                </div>
            </main>

            <footer className="w-full bg-blue-950 py-6 text-center text-blue-200 text-sm mt-auto">
                <p>© {new Date().getFullYear()} IGREJA BATISTA IMPERIAL. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}

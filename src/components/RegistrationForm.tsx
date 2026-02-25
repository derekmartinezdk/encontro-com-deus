"use client";

import { useState } from "react";

export default function RegistrationForm() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert("Erro redirecionando para o pagamento: " + JSON.stringify(data));
            }
        } catch (error) {
            alert("Erro ao enviar formulário.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="inscricao" className="w-full py-20 bg-gray-50 flex justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Garanta sua Vaga</h3>
                    <p className="text-gray-500 mt-2 text-sm">Preencha seus dados para continuar para o pagamento</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo</label>
                        <input id="name" type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="João da Silva" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
                        <input id="email" type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="joao@exemplo.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                        <input id="phone" type="tel" required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="(11) 99999-9999" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20">
                        {loading ? "Processando..." : "Ir para o Pagamento (R$ 120,00)"}
                    </button>
                </form>
            </div>
        </section>
    );
}

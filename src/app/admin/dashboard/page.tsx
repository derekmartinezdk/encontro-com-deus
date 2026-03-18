"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Loading states for download
    const [loadingEncontristas, setLoadingEncontristas] = useState(false);
    const [loadingServos, setLoadingServos] = useState(false);

    // Data states
    const [activeTab, setActiveTab] = useState<"encontristas" | "servos">("encontristas");
    const [encontristas, setEncontristas] = useState<any[]>([]);
    const [servos, setServos] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Modal states
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    useEffect(() => {
        if (!document.cookie.includes("adminAuth=true")) {
            router.push("/admin");
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const [resEnc, resServ] = await Promise.all([
                supabase.from('inscricoes').select('*').order('created_at', { ascending: false }),
                supabase.from('inscricoes_servos').select('*').order('created_at', { ascending: false })
            ]);
            if (resEnc.data) setEncontristas(resEnc.data);
            if (resServ.data) setServos(resServ.data);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            alert("Nenhum dado encontrado para exportação.");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [];
        csvRows.push('\uFEFF' + headers.join(';'));

        for (const row of data) {
            const values = headers.map(header => {
                let cellValue = row[header];
                if (cellValue === null || cellValue === undefined) cellValue = "";
                const escaped = ('' + cellValue).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(';'));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadEncontristas = () => {
        downloadCSV(encontristas, 'lista_encontristas.csv');
    };

    const handleDownloadServos = () => {
        downloadCSV(servos, 'lista_servos.csv');
    };

    const handleLogout = () => {
        document.cookie = "adminAuth=; max-age=0; path=/";
        router.push("/admin");
    };

    const openModal = (user: any) => {
        setSelectedUser(user);
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    if (!isAuthenticated) return null;

    const currentData = activeTab === "encontristas" ? encontristas : servos;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard Administrativo</h1>
                        <p className="text-gray-500 mt-1">Gerencie e exporte as inscrições do evento</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold border border-red-100 transition-colors w-full md:w-auto"
                    >
                        Sair do Painel
                    </button>
                </div>

                {/* Cards de Exportação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* ENCONTRISTAS CARD */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Encontristas</h2>
                        <p className="text-gray-500 mb-6 font-medium text-sm">Total: {encontristas.length}</p>
                        <button
                            onClick={handleDownloadEncontristas}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Baixar CSV
                        </button>
                    </div>

                    {/* SERVOS CARD */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Servos</h2>
                        <p className="text-gray-500 mb-6 font-medium text-sm">Total: {servos.length}</p>
                        <button
                            onClick={handleDownloadServos}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Baixar CSV
                        </button>
                    </div>
                </div>

                {/* Seção de Listagem Dynamic */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("encontristas")}
                            className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition-colors ${activeTab === "encontristas" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
                        >
                            Lista de Encontristas
                        </button>
                        <button
                            onClick={() => setActiveTab("servos")}
                            className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition-colors ${activeTab === "servos" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
                        >
                            Lista de Servos
                        </button>
                    </div>

                    <div className="p-0 overflow-x-auto">
                        {loadingData ? (
                            <div className="p-10 text-center text-gray-500">Carregando dados...</div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                                        <th className="p-4">Nome</th>
                                        <th className="p-4">{activeTab === "encontristas" ? "Líder de Célula" : "Função / Rede"}</th>
                                        <th className="p-4">Status Pgto</th>
                                        <th className="p-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum registro encontrado.</td>
                                        </tr>
                                    ) : (
                                        currentData.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium text-gray-900">{user.nome_completo || "Sem Nome"}</td>
                                                <td className="p-4 text-gray-600">
                                                    {activeTab === "encontristas" 
                                                        ? user.lider_celula || "-" 
                                                        : user.funcao_igreja || user.rede || "-"
                                                    }
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        user.status_pagamento === 'pago' || user.status_pagamento === 'approved' ? 'bg-green-100 text-green-700' :
                                                        user.status_pagamento === 'pendente' || user.status_pagamento === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {(user.status_pagamento || 'desconhecido').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button 
                                                        onClick={() => openModal(user)}
                                                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-2"
                                                    >
                                                        Ver Tudo
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE DETALHES */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900">Detalhes da Inscrição</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                {Object.entries(selectedUser).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">{key.replace(/_/g, ' ')}</div>
                                        <div className="text-sm font-medium text-gray-900 break-words">
                                            {value === null || value === '' ? (
                                                <span className="text-gray-400 italic">Não preenchido</span>
                                            ) : typeof value === 'boolean' ? (
                                                value ? 'Sim' : 'Não'
                                            ) : (
                                                String(value)
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <button onClick={closeModal} className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

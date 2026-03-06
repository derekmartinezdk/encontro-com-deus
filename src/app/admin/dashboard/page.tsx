"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingEncontristas, setLoadingEncontristas] = useState(false);
    const [loadingServos, setLoadingServos] = useState(false);

    useEffect(() => {
        // Verificar cookie de autenticação basicão
        if (!document.cookie.includes("adminAuth=true")) {
            router.push("/admin");
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            alert("Nenhum dado encontrado para exportação.");
            return;
        }

        // Pega os cabeçalhos a partir das chaves do primeiro objeto
        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Adiciona o BOM para que o Excel identifique UTF-8 com os acentos
        csvRows.push('\uFEFF' + headers.join(';'));

        // Formata as linhas
        for (const row of data) {
            const values = headers.map(header => {
                let cellValue = row[header];
                if (cellValue === null || cellValue === undefined) {
                    cellValue = "";
                }
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

    const handleDownloadEncontristas = async () => {
        setLoadingEncontristas(true);
        try {
            const { data, error } = await supabase
                .from('inscricoes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            downloadCSV(data, 'lista_encontristas.csv');
        } catch (error) {
            console.error("Erro exportação encontristas:", error);
            alert("Erro ao buscar encontristas no banco de dados.");
        } finally {
            setLoadingEncontristas(false);
        }
    };

    const handleDownloadServos = async () => {
        setLoadingServos(true);
        try {
            const { data, error } = await supabase
                .from('inscricoes_servos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            downloadCSV(data, 'lista_servos.csv');
        } catch (error) {
            console.error("Erro exportação servos:", error);
            alert("Erro ao buscar servos no banco de dados.");
        } finally {
            setLoadingServos(false);
        }
    };

    const handleLogout = () => {
        document.cookie = "adminAuth=; max-age=0; path=/";
        router.push("/admin");
    };

    if (!isAuthenticated) return null; // Evitar flash de conteúdo antes de checar autenticação

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ENCONTRISTAS CARD */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Encontristas</h2>
                        <p className="text-gray-500 mb-8 font-medium">Exportar lista completa de participantes inscritos (CSV).</p>
                        <button
                            onClick={handleDownloadEncontristas}
                            disabled={loadingEncontristas}
                            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-lg"
                        >
                            {loadingEncontristas ? "Baixando..." : (
                                <>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Baixar Lista
                                </>
                            )}
                        </button>
                    </div>

                    {/* SERVOS CARD */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Servos</h2>
                        <p className="text-gray-500 mb-8 font-medium">Exportar lista da equipe de serviço do encontro (CSV).</p>
                        <button
                            onClick={handleDownloadServos}
                            disabled={loadingServos}
                            className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-lg"
                        >
                            {loadingServos ? "Baixando..." : (
                                <>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Baixar Lista
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

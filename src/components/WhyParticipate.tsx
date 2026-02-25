export default function WhyParticipate() {
    const reasons = [
        {
            title: "Transformação Pessoal",
            description: "Muitos participantes relatam que o Encontro com Deus é uma experiência transformadora que os ajuda a se tornarem pessoas mais compassivas, amorosas e alinhadas com seus valores espirituais."
        },
        {
            title: "Busca por Respostas",
            description: "Algumas pessoas participam do encontro em busca de respostas para perguntas espirituais ou existenciais. Esse ambiente pode ser um espaço seguro para explorar essas questões e receber insights valiosos."
        },
        {
            title: "Nova Comunidade",
            description: "O Encontro com Deus muitas vezes reúne pessoas que compartilham valores e interesses espirituais semelhantes. Isso cria uma comunidade de apoio onde você pode se sentir aceito, compreendido e apoiado por outros participantes."
        },
        {
            title: "Renovo da Fé",
            description: "O Encontro com Deus oferece um ambiente propício para se reconectar com sua espiritualidade e renovar sua fé. Pode ser uma oportunidade para revitalizar e fortalecer sua relação com o Deus."
        },
        {
            title: "Quebra de Rotina",
            description: "Participar de um encontro espiritual proporciona uma pausa na rotina diária, permitindo que você se desconecte do ritmo acelerado da vida moderna e se concentre em aspectos mais profundos da existência."
        }
    ];

    return (
        <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
                        POR QUE PARTICIPAR DO ENCONTRO COM DEUS?
                    </h2>
                    <p className="text-gray-600 italic mt-4 text-center max-w-2xl mx-auto text-lg">
                        "Buscai ao Senhor enquanto se pode achar, invocai-o enquanto está perto." - Isaías 55:6
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reasons.map((reason, index) => (
                        <div key={index} className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {reason.title}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {reason.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

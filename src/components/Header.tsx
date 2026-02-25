import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="relative flex justify-center items-center w-full py-4 bg-white shadow-sm sticky top-0 z-50">
            {/* Logo da Esquerda (Mão) - Posicionamento Absoluto */}
            <div className="absolute left-4 md:left-8">
                <Image
                    src="/logo_mao.png"
                    alt="Logo Mão"
                    width={200}
                    height={80}
                    className="h-20 md:h-24 w-auto object-contain"
                    priority
                />
            </div>

            {/* Logo Central (IBI) - Mantém a altura do header */}
            <div className="z-10">
                <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                    <Image
                        src="/logo-ibi.png"
                        alt="Logo Igreja Batista Imperial"
                        width={240}
                        height={80}
                        className="h-16 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* Logo da Direita (Kids) - Posicionamento Absoluto */}
            <div className="absolute right-4 md:right-8">
                <Image
                    src="/logo_kids.png"
                    alt="Logo Kids"
                    width={120}
                    height={48}
                    className="h-12 w-auto object-contain"
                    priority
                />
            </div>
        </header>
    );
}

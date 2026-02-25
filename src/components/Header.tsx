import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="relative flex flex-row justify-between md:justify-center items-center w-full py-2 px-4 md:py-4 md:px-0 bg-white shadow-sm sticky top-0 z-50">
            {/* Logo da Esquerda (Mão) */}
            <div className="relative md:absolute md:left-8">
                <Image
                    src="/logo_mao.png"
                    alt="Logo Mão"
                    width={200}
                    height={80}
                    className="h-8 md:h-24 w-auto object-contain"
                    priority
                />
            </div>

            {/* Logo Central (IBI) */}
            <div className="z-10">
                <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                    <Image
                        src="/logo-ibi.png"
                        alt="Logo Igreja Batista Imperial"
                        width={240}
                        height={80}
                        className="h-10 md:h-16 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* Logo da Direita (Kids) */}
            <div className="relative md:absolute md:right-8">
                <Image
                    src="/logo_kids.png"
                    alt="Logo Kids"
                    width={120}
                    height={48}
                    className="h-6 md:h-12 w-auto object-contain"
                    priority
                />
            </div>
        </header>
    );
}

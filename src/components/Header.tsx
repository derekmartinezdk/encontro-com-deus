import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="relative flex flex-col md:flex-row justify-center items-center w-full py-4 gap-4 md:gap-0 bg-white shadow-sm sticky top-0 z-50">
            {/* Logo da Esquerda (Mão) */}
            <div className="relative md:absolute left-0 md:left-8 order-2 md:order-none">
                <Image
                    src="/logo_mao.png"
                    alt="Logo Mão"
                    width={200}
                    height={80}
                    className="h-16 md:h-24 w-auto object-contain"
                    priority
                />
            </div>

            {/* Logo Central (IBI) */}
            <div className="z-10 order-1 md:order-none">
                <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                    <Image
                        src="/logo-ibi.png"
                        alt="Logo Igreja Batista Imperial"
                        width={240}
                        height={80}
                        className="h-14 md:h-16 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* Logo da Direita (Kids) */}
            <div className="relative md:absolute right-0 md:right-8 order-3 md:order-none">
                <Image
                    src="/logo_kids.png"
                    alt="Logo Kids"
                    width={120}
                    height={48}
                    className="h-10 md:h-12 w-auto object-contain"
                    priority
                />
            </div>
        </header>
    );
}

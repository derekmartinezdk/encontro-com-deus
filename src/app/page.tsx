import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WhyParticipate from "@/components/WhyParticipate";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-200">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <WhyParticipate />
      </main>
      <footer className="w-full bg-blue-950 py-8 text-center text-blue-200 text-sm">
        <p>© {new Date().getFullYear()} IGREJA BATISTA IMPERIAL. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Events />
        <Gallery />
        {/* ShareMemories.tsx and /upload remain in the codebase, but frontend access is intentionally hidden. */}
      </main>
      <Footer />
    </>
  );
}

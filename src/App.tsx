import { useEffect, useState } from 'react';
import { Button, FloatingButton, Logo, Navbar } from 'nekkora-lib';
import { NAV_LINKS, whatsappUrl } from './config';
import { Contact } from './sections/Contact';
import { Differentials } from './sections/Differentials';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Hosting } from './sections/Hosting';
import { HowItWorks } from './sections/HowItWorks';
import { Monitoring } from './sections/Monitoring';
import { Services } from './sections/Services';
import { Studio } from './sections/Studio';
import { Support } from './sections/Support';

/** Retorna o href (#id) da seção do menu que está visível. */
function useActiveSection(hrefs: string[]) {
  const [active, setActive] = useState(hrefs[0]);
  useEffect(() => {
    const sections = hrefs.map((h) => document.querySelector(h)).filter((el): el is Element => el != null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [hrefs]);
  return active;
}

const HREFS = NAV_LINKS.map((l) => l.href);

/** true enquanto a seção de contato está visível (ela já tem o próprio botão de WhatsApp). */
function useContactVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById('contato');
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return visible;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export function App() {
  const active = useActiveSection(HREFS);
  // No celular, o botão flutuante sai de cena enquanto o contato está visível.
  const contactVisible = useContactVisible();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const tucked = contactVisible && isMobile;

  return (
    <div className="page">
      <a className="nk-visually-hidden" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navbar
        brand={<Logo size={26} title="Nekkora — início" />}
        brandHref="#inicio"
        links={NAV_LINKS}
        activeHref={active}
        actions={
          <Button size="sm" leftIcon="whatsapp" href={whatsappUrl()}>
            Falar no WhatsApp
          </Button>
        }
      />
      <main id="conteudo">
        <Hero />
        <Services />
        <HowItWorks />
        <Studio />
        <Hosting />
        <Monitoring />
        <Support />
        <Differentials />
        <Contact />
      </main>
      <Footer />
      <FloatingButton
        href={whatsappUrl()}
        icon="whatsapp"
        label="Fale conosco"
        tone="whatsapp"
        pulse
        className={tucked ? 'fab--tucked' : undefined}
        aria-hidden={tucked || undefined}
        tabIndex={tucked ? -1 : undefined}
      />
    </div>
  );
}

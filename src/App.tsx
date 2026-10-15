import { useEffect, useState } from 'react';
import { Button, FloatingButton, Logo, Navbar, ThemeToggle, themes, useTheme } from 'nekkora-lib';
import { NAV_LINKS, whatsappUrl } from './config';
import { Combined } from './sections/Combined';
import { Contact } from './sections/Contact';
import { Delivery } from './sections/Delivery';
import { Differentials } from './sections/Differentials';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Hosting } from './sections/Hosting';
import { HowItWorks } from './sections/HowItWorks';
import { Solutions } from './sections/Solutions';
import { Transparency } from './sections/Transparency';

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

/** Mantém a cor da barra do navegador (meta theme-color) igual ao fundo do tema ativo. */
function useThemeColorMeta() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes[resolvedTheme].palette.bg);
  }, [resolvedTheme]);
}

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

/** WhatsApp só com número confirmado em config.ts (sem destino provisório). */
const WHATSAPP = whatsappUrl();

export function App() {
  const active = useActiveSection(HREFS);
  useThemeColorMeta();
  // No celular, o botão flutuante sai de cena enquanto o contato está visível.
  const contactVisible = useContactVisible();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const tucked = contactVisible && isMobile;

  return (
    <div className={WHATSAPP ? 'page page--fab' : 'page'}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navbar
        brand={<Logo size={26} title="Nekkora — início" />}
        brandHref="#inicio"
        links={NAV_LINKS}
        activeHref={active}
        tools={<ThemeToggle />}
        actions={
          <Button size="sm" rightIcon="arrow-right" href="#contato">
            Solicitar avaliação
          </Button>
        }
      />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Solutions />
        <Delivery />
        <HowItWorks />
        <Hosting />
        <Combined />
        <Differentials />
        <Transparency />
        <Contact />
      </main>
      <Footer />
      {WHATSAPP && (
        <FloatingButton
          href={WHATSAPP}
          icon="whatsapp"
          label="Fale conosco"
          tone="whatsapp"
          pulse
          className={tucked ? 'fab--tucked' : undefined}
          aria-hidden={tucked || undefined}
          tabIndex={tucked ? -1 : undefined}
        />
      )}
    </div>
  );
}

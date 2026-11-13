import { useEffect, useState } from 'react';
import { Button, FloatingButton, Logo, Navbar, ThemeToggle, themes, useTheme } from 'nekkora-lib';
import { NAV_LINKS, PLATFORM_LOGIN_URL } from './config';
import { useMediaQuery } from './hooks';
import { Contact } from './sections/Contact';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Hosting } from './sections/Hosting';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';
import { Privacy } from './sections/Privacy';
import { Solutions } from './sections/Solutions';
import { Transparency } from './sections/Transparency';
import { WHATSAPP_SR, whatsappHref } from './whatsapp';

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

/**
 * true enquanto algum bloco que já tem o próprio botão de WhatsApp está visível: os botões do topo e a seção de contato
 * (NEKKORA-COM-CANAIS-001 — no celular, o botão flutuante cobriria o CTA do topo, que faz a mesma coisa).
 */
function useOwnWhatsappVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const els = [document.querySelector('.hero__ctas'), document.getElementById('contato')].filter((el): el is Element => el != null);
    if (els.length === 0) return;
    const seen = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target, e.isIntersecting));
        setVisible([...seen.values()].some(Boolean));
      },
      // qualquer parte visível já conta: no celular, o CTA do topo aparece só em parte na primeira tela
      { threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return visible;
}

/** WhatsApp só com número confirmado em config.ts (sem destino provisório). */
const WHATSAPP = whatsappHref('geral');

/** Texto do botão flutuante (NEKKORA-COM-CANAIS-001): sem promessa de disponibilidade ou de resposta imediata. */
const FAB_TEXT = 'Fale com um analista';

export function App() {
  const active = useActiveSection(HREFS);
  useThemeColorMeta();
  // No celular, o botão flutuante sai de cena enquanto os botões do topo ou o contato estão visíveis.
  const ownWhatsappVisible = useOwnWhatsappVisible();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const tucked = ownWhatsappVisible && isMobile;
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
        // NEKKORA-COM-CANAIS-001 (titular, 12/11/2026; substitui a decisão de ocultar da COM-008-B, AUD-26, PUB-16):
        // "Entrar" leva à Nekkora Platform, na mesma aba. A Commercial não autentica nem tem tela de login. No desktop
        // fica à direita, depois do seletor de tema; no celular, dentro do menu.
        actions={
          <Button href={PLATFORM_LOGIN_URL} target="_self" variant="secondary" size="sm" data-entrar="">
            Entrar
          </Button>
        }
      />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Solutions />
        <Pricing />
        <HowItWorks />
        <Hosting />
        <Transparency />
        <Contact />
        <Privacy />
      </main>
      <Footer />
      {/* Atendimento comercial (NEKKORA-COM-CANAIS-001): ícone e texto lado a lado, sem pulso nem indicador de
          "online" — nada sugere disponibilidade ou resposta imediata. Outra aba, sem opener e sem Referer. */}
      {WHATSAPP && (
        <FloatingButton
          href={WHATSAPP}
          icon="whatsapp"
          label={`${FAB_TEXT} ${WHATSAPP_SR}`}
          tooltip={false}
          tone="whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          data-whatsapp="geral"
          className={tucked ? 'fab--label fab--tucked' : 'fab--label'}
          aria-hidden={tucked || undefined}
          tabIndex={tucked ? -1 : undefined}
        >
          <span className="fab__text" aria-hidden="true">
            {FAB_TEXT}
          </span>
        </FloatingButton>
      )}
    </div>
  );
}

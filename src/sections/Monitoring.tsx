import { Badge, Card, CardHeader, IconBox, SectionHeader, Table, type IconName, type TableColumn } from 'nekkora-lib';
import { ObservabilityScene } from '../illustrations/Scenes';

const TOPICS: [IconName, string, string][] = [
  ['eye', 'Visibilidade da operação', 'Um retrato claro do que está rodando agora.'],
  ['play-circle', 'Acompanhamento de execuções', 'Cada execução registrada, com início, duração e resultado.'],
  ['alert', 'Identificação de falhas', 'Falhas percebidas rápido, antes de virarem problema maior.'],
  ['file', 'Histórico operacional', 'Logs e eventos guardados para entender o que aconteceu.'],
  ['headset', 'Apoio na resposta a incidentes', 'Quando algo sai do esperado, agimos junto com você.'],
];

type Row = { id: number; processo: string; status: 'Concluído' | 'Em execução' | 'Falhou' | 'Reprocessado'; hora: string; detalhe: string };

const TONE = { Concluído: 'success', 'Em execução': 'info', Falhou: 'danger', Reprocessado: 'warning' } as const;

const ROWS: Row[] = [
  { id: 1, processo: 'Conciliação Bancária', status: 'Concluído', hora: '10:24', detalhe: '412 lançamentos conciliados' },
  { id: 2, processo: 'Envio de Relatórios', status: 'Em execução', hora: '10:31', detalhe: 'Etapa 3 de 5' },
  { id: 3, processo: 'Atualização de Cadastro', status: 'Falhou', hora: '09:58', detalhe: 'Portal indisponível · alerta enviado' },
  { id: 4, processo: 'Atualização de Cadastro', status: 'Reprocessado', hora: '10:06', detalhe: 'Concluído na nova tentativa' },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'processo', header: 'Processo' },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <Badge tone={TONE[r.status]} variant="solid" size="sm">
        {r.status}
      </Badge>
    ),
  },
  { key: 'hora', header: 'Hora', muted: true, width: 72 },
  { key: 'detalhe', header: 'Evento', render: (r) => <span className="log-line">{r.detalhe}</span> },
];

export function Monitoring() {
  return (
    <section id="monitoramento" className="section section--band" aria-labelledby="monitoramento-title">
      <div className="wrap stack" style={{ gap: 56 }}>
        <SectionHeader
          titleId="monitoramento-title"
          align="center"
          eyebrow="Monitoramento e observabilidade"
          title="Não basta executar. É preciso acompanhar."
          description="Acompanhamos execuções, status, falhas, logs e o comportamento da sua automação no dia a dia. Você não recebe só robôs rodando: recebe uma operação supervisionada."
        />
        <div className="split">
          <div className="split__visual">
            <ObservabilityScene />
          </div>
          <ul className="features">
            {TOPICS.map(([icon, title, text]) => (
              <li key={title} className="feature">
                <IconBox icon={icon} tone="accent" variant="soft" size="md" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Card className="monitor-table" variant="surface" padding="none" aria-label="Exemplo de acompanhamento de execuções">
          <CardHeader
            icon="pulse"
            iconVariant="solid"
            title="Execuções acompanhadas"
            subtitle="Exemplo de como a operação aparece para você"
            action={
              <Badge tone="success" variant="outline" dot>
                Monitorando
              </Badge>
            }
          />
          <Table columns={COLUMNS} data={ROWS} rowKey="id" />
        </Card>
      </div>
    </section>
  );
}

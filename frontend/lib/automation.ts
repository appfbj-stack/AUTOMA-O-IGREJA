import { obs, xr12, sonoff } from './api';
import { getAutomacao, getDispositivos, addLog, AcaoAutomacao } from './db';

type AcaoResult = { tipo: string; success: boolean; error?: string };

export async function executarAcao(
  acao: AcaoAutomacao,
  dispositivos: Awaited<ReturnType<typeof getDispositivos>>
): Promise<AcaoResult> {
  const { tipo, parametros } = acao;

  try {
    switch (tipo) {
      case 'obs_stream_start':
        await obs.streamStart();
        break;
      case 'obs_stream_stop':
        await obs.streamStop();
        break;
      case 'obs_record_start':
        await obs.recordStart();
        break;
      case 'obs_record_stop':
        await obs.recordStop();
        break;
      case 'obs_scene':
        await obs.setScene(parametros.scene as string);
        break;
      case 'xr12_preset':
        await xr12.preset(parametros.nome as string);
        break;
      case 'xr12_mute':
        await xr12.mute(parametros.channel as number, parametros.mute as boolean);
        break;
      case 'sonoff_on':
      case 'sonoff_off': {
        const on = tipo === 'sonoff_on';
        const grupo = parametros.grupo as string;
        // Filtrar dispositivos Sonoff pelo grupo (nome contém o grupo)
        const targets = dispositivos.filter(
          d => d.tipo === 'sonoff' && d.nome.toLowerCase().includes(grupo.toLowerCase())
        );
        if (targets.length === 0) {
          throw new Error(`Nenhum dispositivo Sonoff encontrado para grupo: ${grupo}`);
        }
        await sonoff.batch(targets.map(d => ({ ip: d.ip, on })));
        break;
      }
      default:
        throw new Error(`Tipo de ação desconhecido: ${tipo}`);
    }
    return { tipo, success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { tipo, success: false, error: msg };
  }
}

export async function executarAutomacao(
  automacaoId: string,
  usuario: string
): Promise<AcaoResult[]> {
  const automacao = await getAutomacao(automacaoId);
  if (!automacao) throw new Error(`Automação não encontrada: ${automacaoId}`);

  const dispositivos = await getDispositivos();
  const resultados: AcaoResult[] = [];

  for (const acao of automacao.acoes) {
    const resultado = await executarAcao(acao, dispositivos);
    resultados.push(resultado);

    await addLog({
      data: new Date().toISOString(),
      acao: `${automacao.nome} → ${acao.tipo}`,
      usuario,
      resultado: resultado.success ? 'sucesso' : 'erro',
      detalhes: resultado.error,
    });

    // Para em caso de erro crítico OBS
    if (!resultado.success && tipo_critico(acao.tipo)) break;
  }

  return resultados;
}

function tipo_critico(tipo: string): boolean {
  return false; // Por padrão, continua mesmo com erros
}

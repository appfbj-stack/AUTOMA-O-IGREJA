import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Dispositivo {
  id: string;
  nome: string;
  tipo: 'obs' | 'xr12' | 'sonoff';
  ip: string;
  porta: number;
  status: 'online' | 'offline' | 'desconhecido';
}

export interface AcaoAutomacao {
  tipo: string;
  parametros: Record<string, unknown>;
}

export interface Automacao {
  id: string;
  nome: string;
  descricao?: string;
  acoes: AcaoAutomacao[];
}

export interface Preset {
  id: string;
  nome: string;
  tipo: 'obs' | 'xr12';
  config: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  data: string;
  acao: string;
  usuario: string;
  resultado: 'sucesso' | 'erro';
  detalhes?: string;
}

interface EkklesiaDB extends DBSchema {
  dispositivos: { key: string; value: Dispositivo };
  automacoes: { key: string; value: Automacao };
  presets: { key: string; value: Preset };
  logs: { key: string; value: LogEntry; indexes: { 'by-data': string } };
}

let dbInstance: IDBPDatabase<EkklesiaDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<EkklesiaDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<EkklesiaDB>('ekklesia-control', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('dispositivos')) {
        db.createObjectStore('dispositivos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('automacoes')) {
        db.createObjectStore('automacoes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('presets')) {
        db.createObjectStore('presets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('logs')) {
        const logStore = db.createObjectStore('logs', { keyPath: 'id' });
        logStore.createIndex('by-data', 'data');
      }
    },
  });

  await seedDefaultData(dbInstance);
  return dbInstance;
}

async function seedDefaultData(db: IDBPDatabase<EkklesiaDB>) {
  const automacoes = await db.getAll('automacoes');
  if (automacoes.length > 0) return;

  const defaults: Automacao[] = [
    {
      id: 'iniciar-culto',
      nome: 'Iniciar Culto',
      descricao: 'Liga som, iluminação, grava e inicia live',
      acoes: [
        { tipo: 'sonoff_on', parametros: { grupo: 'som' } },
        { tipo: 'sonoff_on', parametros: { grupo: 'luz_altar' } },
        { tipo: 'xr12_preset', parametros: { nome: 'pregacao' } },
        { tipo: 'obs_record_start', parametros: {} },
        { tipo: 'obs_stream_start', parametros: {} },
      ],
    },
    {
      id: 'modo-louvor',
      nome: 'Modo Louvor',
      descricao: 'Configura para momento de louvor',
      acoes: [
        { tipo: 'xr12_preset', parametros: { nome: 'louvor' } },
        { tipo: 'obs_scene', parametros: { scene: 'Louvor' } },
        { tipo: 'sonoff_on', parametros: { grupo: 'luz_palco_forte' } },
      ],
    },
    {
      id: 'modo-pregacao',
      nome: 'Modo Pregação',
      descricao: 'Configura para momento de pregação',
      acoes: [
        { tipo: 'xr12_preset', parametros: { nome: 'pregacao' } },
        { tipo: 'obs_scene', parametros: { scene: 'Pregação' } },
        { tipo: 'sonoff_on', parametros: { grupo: 'luz_palco_normal' } },
      ],
    },
    {
      id: 'encerrar-culto',
      nome: 'Encerrar Culto',
      descricao: 'Para live, gravação e desliga equipamentos',
      acoes: [
        { tipo: 'obs_stream_stop', parametros: {} },
        { tipo: 'obs_record_stop', parametros: {} },
        { tipo: 'sonoff_off', parametros: { grupo: 'luzes' } },
        { tipo: 'sonoff_off', parametros: { grupo: 'som' } },
      ],
    },
  ];

  for (const auto of defaults) {
    await db.put('automacoes', auto);
  }
}

// ---- Logs ----
export async function addLog(entry: Omit<LogEntry, 'id'>): Promise<void> {
  const db = await getDB();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await db.put('logs', { id, ...entry });
}

export async function getLogs(limit = 100): Promise<LogEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('logs', 'by-data');
  return all.reverse().slice(0, limit);
}

// ---- Dispositivos ----
export async function getDispositivos(): Promise<Dispositivo[]> {
  const db = await getDB();
  return db.getAll('dispositivos');
}

export async function saveDispositivo(d: Dispositivo): Promise<void> {
  const db = await getDB();
  await db.put('dispositivos', d);
}

export async function deleteDispositivo(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('dispositivos', id);
}

// ---- Automações ----
export async function getAutomacoes(): Promise<Automacao[]> {
  const db = await getDB();
  return db.getAll('automacoes');
}

export async function saveAutomacao(a: Automacao): Promise<void> {
  const db = await getDB();
  await db.put('automacoes', a);
}

export async function getAutomacao(id: string): Promise<Automacao | undefined> {
  const db = await getDB();
  return db.get('automacoes', id);
}

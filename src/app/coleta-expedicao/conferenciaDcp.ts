export type ConferenciaDcp = {
  id: string;
  quando: string;
  viagem: string;
  pedido: string;
  origem: string;
  saida: string;
  tipologia: string;
  placa: string;
  peso: string;
  volumes: string;
  cubagem: string;
  capacidade: string;
  lojas: string;
  tapume: boolean;
  cordas: number;
  doca: string;
  lacre: string;
  observacao: string;
};

const CHAVE = 'fury-dcp-conferencias';

let bruto = '';
let cache: ConferenciaDcp[] = [];
const ouvintes = new Set<() => void>();

export function lerConferencias(): ConferenciaDcp[] {
  if (typeof sessionStorage === 'undefined') return cache;
  const atual = sessionStorage.getItem(CHAVE) ?? '[]';
  if (atual !== bruto) {
    bruto = atual;
    try {
      cache = JSON.parse(atual) as ConferenciaDcp[];
    } catch {
      cache = [];
    }
  }
  return cache;
}

export function registrarConferencia(item: ConferenciaDcp) {
  const lista = [item, ...lerConferencias().filter(atual => atual.id !== item.id)];
  bruto = JSON.stringify(lista);
  cache = lista;
  sessionStorage.setItem(CHAVE, bruto);
  ouvintes.forEach(ouvir => ouvir());
}

export function assinarConferencias(ouvir: () => void) {
  ouvintes.add(ouvir);
  return () => {
    ouvintes.delete(ouvir);
  };
}

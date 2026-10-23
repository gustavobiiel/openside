export type ItemConsolidador = {
  nome: string;
  quantidade: string;
  pesoKg: number;
};

export type ConsolidadorCarga = {
  codigo: string;
  loja: string;
  pesoKg: number;
  atrasado: boolean;
  itens: ItemConsolidador[];
};

/** Os quatro primeiros fecham os 3.000 kg do VUC; o restante não cabe. */
export const CONSOLIDADORES_PADRAO: ConsolidadorCarga[] = [
  {
    codigo: '789038110000000001',
    loja: 'Loja 0381',
    pesoKg: 900,
    atrasado: false,
    itens: [
      {nome: 'Caixa de eletro', quantidade: '12 un', pesoKg: 420},
      {nome: 'Fardo de têxtil', quantidade: '8 un', pesoKg: 480},
    ],
  },
  {
    codigo: '789038110000000002',
    loja: 'Loja 0381',
    pesoKg: 700,
    atrasado: false,
    itens: [
      {nome: 'Caixa de bazar', quantidade: '20 un', pesoKg: 260},
      {nome: 'Fardo de cama', quantidade: '6 un', pesoKg: 440},
    ],
  },
  {
    codigo: '789038110000000003',
    loja: 'Loja 0381',
    pesoKg: 450,
    atrasado: true,
    itens: [
      {nome: 'Caixa de brinquedo', quantidade: '15 un', pesoKg: 180},
      {nome: 'Volume avulso', quantidade: '4 un', pesoKg: 270},
    ],
  },
  {
    codigo: '789120710000000001',
    loja: 'Loja 1207',
    pesoKg: 800,
    atrasado: false,
    itens: [
      {nome: 'Fardo de moda', quantidade: '10 un', pesoKg: 500},
      {nome: 'Caixa de calçado', quantidade: '18 un', pesoKg: 300},
    ],
  },
  {
    codigo: '789120710000000002',
    loja: 'Loja 1207',
    pesoKg: 600,
    atrasado: true,
    itens: [{nome: 'Pallet de utilidades', quantidade: '1 un', pesoKg: 600}],
  },
  {
    codigo: '789095410000000001',
    loja: 'Loja 0954',
    pesoKg: 600,
    atrasado: false,
    itens: [{nome: 'Pallet de mercearia', quantidade: '1 un', pesoKg: 600}],
  },
  {
    codigo: '789095410000000002',
    loja: 'Loja 0954',
    pesoKg: 500,
    atrasado: false,
    itens: [
      {nome: 'Caixa de higiene', quantidade: '24 un', pesoKg: 220},
      {nome: 'Fardo de papel', quantidade: '8 un', pesoKg: 280},
    ],
  },
  {
    codigo: '789095410000000003',
    loja: 'Loja 0954',
    pesoKg: 350,
    atrasado: true,
    itens: [{nome: 'Volume de temporada', quantidade: '6 un', pesoKg: 350}],
  },
];

export function consolidadoresDoEmbarque(
  id: string,
  loja: string,
  capacidadeKg: number | null,
): ConsolidadorCarga[] {
  const base = capacidadeKg ?? 3000;
  const primeiro = Math.round(base * 0.4);
  const segundo = Math.round(base * 0.35);
  const terceiro = base - primeiro - segundo;
  const quarto = Math.round(base * 0.2);
  const pesos = [primeiro, segundo, terceiro, quarto];
  const semente = id.replace(/\D/g, '').padStart(4, '0').slice(-4);

  return pesos.map((pesoKg, index) => {
    const principal = Math.round(pesoKg * 0.6);
    return {
      codigo: `${semente}${String(index + 1).padStart(14, '0')}`,
      loja,
      pesoKg,
      atrasado: index === 1 || index === 3,
      itens: [
        {nome: 'Volume principal', quantidade: '1 un', pesoKg: principal},
        {nome: 'Volume complementar', quantidade: '1 un', pesoKg: pesoKg - principal},
      ],
    };
  });
}

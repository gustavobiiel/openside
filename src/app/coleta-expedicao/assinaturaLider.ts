const CHAVE = 'fury-assinatura-lider';

export type AssinaturaLider = {
  imagem: string;
  senha: string;
};

export function lerAssinatura(): AssinaturaLider | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const valor = JSON.parse(bruto) as AssinaturaLider;
    if (!valor.imagem || !/^\d{6}$/.test(valor.senha)) return null;
    return valor;
  } catch {
    return null;
  }
}

export function guardarAssinatura(valor: AssinaturaLider) {
  localStorage.setItem(CHAVE, JSON.stringify(valor));
}

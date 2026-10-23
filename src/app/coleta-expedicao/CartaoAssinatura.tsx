import {useEffect, useRef, useState, type PointerEvent as ReactPointerEvent} from 'react';
import {createPortal} from 'react-dom';
import {guardarAssinatura, lerAssinatura} from './assinaturaLider';

export function CaixasSeis({
  valor,
  onChange,
  rotulo,
}: {
  valor: string;
  onChange: (valor: string) => void;
  rotulo: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function escrever(indice: number, texto: string) {
    const limpo = texto.replace(/\D/g, '');
    if (!limpo) return;
    const partida = limpo.length >= 6 ? 0 : indice;
    const proximo = valor.padEnd(6, ' ').slice(0, 6).split('');
    limpo
      .slice(0, 6 - partida)
      .split('')
      .forEach((char, offset) => {
        proximo[partida + offset] = char;
      });
    const senha = proximo.join('').replace(/\s/g, '').slice(0, 6);
    onChange(senha);
    const foco = Math.min(senha.length, 5);
    refs.current[foco]?.focus();
  }

  return (
    <div className="uber-senha" role="group" aria-label={rotulo}>
      {Array.from({length: 6}, (_, indice) => (
        <input
          key={indice}
          ref={node => {
            refs.current[indice] = node;
          }}
          className="uber-senha-casa"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          aria-label={`Dígito ${indice + 1} de 6`}
          value={valor[indice] ?? ''}
          onChange={event => escrever(indice, event.target.value)}
          onFocus={event => event.currentTarget.select()}
          onKeyDown={event => {
            if (event.key !== 'Backspace') return;
            event.preventDefault();
            if (valor[indice]) {
              onChange(valor.slice(0, indice) + valor.slice(indice + 1));
              return;
            }
            if (indice > 0) {
              onChange(valor.slice(0, indice - 1));
              refs.current[indice - 1]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}

export default function CartaoAssinatura({onFechar}: {onFechar: () => void}) {
  const tela = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [temTraco, setTemTraco] = useState(false);
  const [senha, setSenha] = useState('');
  const [aviso, setAviso] = useState('');
  const salva = lerAssinatura();

  useEffect(() => {
    const canvas = tela.current;
    if (!canvas) return;
    const id = requestAnimationFrame(() => {
      const rect = canvas.getBoundingClientRect();
      const densidade = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * densidade);
      canvas.height = Math.round(rect.height * densidade);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function preparar() {
    const canvas = tela.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2) return;
    const densidade = window.devicePixelRatio || 1;
    const largura = Math.round(rect.width * densidade);
    const altura = Math.round(rect.height * densidade);
    if (canvas.width === largura && canvas.height === altura) return;
    canvas.width = largura;
    canvas.height = altura;
  }

  function ponto(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = tela.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;
    const rect = canvas.getBoundingClientRect();
    const escala = canvas.width / rect.width;
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.lineWidth = escala * 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return {
      ctx,
      x: (event.clientX - rect.left) * escala,
      y: (event.clientY - rect.top) * escala,
    };
  }

  function salvar() {
    const canvas = tela.current;
    if (!canvas || !temTraco) {
      setAviso('Desenhe a assinatura.');
      return;
    }
    if (!/^\d{6}$/.test(senha)) {
      setAviso('A senha precisa ter 6 dígitos.');
      return;
    }
    guardarAssinatura({imagem: canvas.toDataURL('image/png'), senha});
    onFechar();
  }

  return createPortal(
    <div className="uber-velo" role="presentation">
      <button type="button" className="uber-velo-fundo" aria-label="Fechar" onClick={onFechar} />
      <section className="uber-velo-card" role="dialog" aria-modal="true" aria-label="Assinatura">
        <h2>Assinatura</h2>
        <p>Desenhe a assinatura do líder e defina a senha de 6 dígitos.</p>
        {salva ? <img className="uber-assinatura-preview" src={salva.imagem} alt="Assinatura salva" /> : null}
        <canvas
          ref={tela}
          className="uber-assinatura-tela"
          aria-label="Desenhar assinatura"
          onPointerDown={event => {
            if (!temTraco) preparar();
            const desenho = ponto(event);
            if (!desenho) return;
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              /* o traço segue mesmo sem captura do ponteiro */
            }
            desenho.ctx.beginPath();
            desenho.ctx.moveTo(desenho.x, desenho.y);
            desenhando.current = true;
          }}
          onPointerMove={event => {
            if (!desenhando.current) return;
            const desenho = ponto(event);
            if (!desenho) return;
            desenho.ctx.lineTo(desenho.x, desenho.y);
            desenho.ctx.stroke();
            if (!temTraco) setTemTraco(true);
          }}
          onPointerUp={() => {
            desenhando.current = false;
          }}
          onPointerCancel={() => {
            desenhando.current = false;
          }}
        />
        <CaixasSeis valor={senha} onChange={setSenha} rotulo="Senha da assinatura" />
        {aviso ? <p className="uber-velo-erro">{aviso}</p> : null}
        <div className="uber-velo-acoes">
          <button type="button" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" onClick={salvar}>
            Salvar
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

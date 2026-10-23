'use client';

const MAPA =
  'https://static-maps.uber.com/map?width=300&height=200&marker=lat%3A-23.53861%24lng%3A-46.91794%24icon%3Ahttp%3A%2F%2Fd1a3f4spazzrp4.cloudfront.net%2Freceipt-new%2Fmarker-start2%401x.png&marker=lat%3A-23.54933%24lng%3A-46.92283%24icon%3Ahttp%3A%2F%2Fd1a3f4spazzrp4.cloudfront.net%2Freceipt-new%2Fmarker-finish2%401x.png&polyline=color%3A0xFF000000%24width%3A4%24enc%3AhktnCbtj%7DGkAx%40HbCuF%7EBBfAtH%5C%60GbB%7CGjH%7CDrIfD%7DJrHDnE%7CApCAxEjDbAnJxAjBp%40oBc%40uFzD%7BD&source=769a605b_1c9b_3da4_a486_ccc264a18174&signature=CTuTHEdt6BJ4jlqFsvRW-O8SccE=';

const AREAS = [
  'Usuários',
  'Viagens e entregas',
  'Entregas',
  'Estabelecimentos e restaurantes',
  'Bicicletas e patinetes',
  'Uber para Empresas',
  'Freight',
  'Fleet',
];

const TOPICOS = [
  'Encontrar objeto perdido',
  'Reportar problema de segurança',
  'Enviar comentário sobre o motorista parceiro',
  'Ajuda com sua viagem',
];

function IconBusca() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m22.355 20.935-4.68-4.68a8.963 8.963 0 0 0 1.97-5.61 9 9 0 1 0-9 9c2.12 0 4.07-.74 5.61-1.97l4.68 4.68 1.42-1.42Zm-11.71-3.29c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconPartida() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Zm0-2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconDestino() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 9v6H9V9h6Zm0-2H9c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m8.205 5 5.11 7-5.11 7h2.47l5.12-7-5.12-7h-2.47Z" fill="currentColor" />
    </svg>
  );
}

function Estrelas() {
  return (
    <span className="uber-ajuda-estrelas" role="img" aria-label="5 estrelas">
      {Array.from({length: 5}, (_, index) => (
        <svg key={index} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m12 2.5 2.7 6.4 6.8.6-5.2 4.4 1.6 6.6L12 16.8 6.1 20.5l1.6-6.6L2.5 9.5l6.8-.6L12 2.5Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}

export default function TelaAjuda() {
  return (
    <div className="uber-ajuda">
      <div className="uber-ajuda-sub">
        <span className="uber-ajuda-marca">Ajuda</span>
        <div className="uber-ajuda-areas" role="navigation" aria-label="Áreas da ajuda">
          {AREAS.map(area => (
            <span
              key={area}
              className={area === 'Usuários' ? 'uber-ajuda-area is-active' : 'uber-ajuda-area'}>
              {area}
            </span>
          ))}
        </div>
      </div>

      <div className="uber-ajuda-corpo">
        <div className="uber-ajuda-crumb">
          <nav aria-label="Caminho">
            <span>Início</span>
          </nav>
          <button type="button" className="uber-ajuda-busca" aria-label="Buscar">
            <IconBusca />
          </button>
        </div>

        <section className="uber-ajuda-bloco" aria-label="Viagem selecionada">
          <div className="uber-ajuda-head">
            <h2>Viagem selecionada</h2>
            <button type="button">Ver todas</button>
          </div>
          <article className="uber-ajuda-viagem">
            <div className="uber-ajuda-dados">
              <strong>UberX</strong>
              <p>17 de out. de 2026</p>
              <p className="uber-ajuda-endereco">
                <IconPartida />
                <span>Avenida Carolina de Abreu Paulino, 174, Itapevi - SP, 06654-140, Brasil</span>
              </p>
              <p className="uber-ajuda-endereco">
                <IconDestino />
                <span>CD Cajamar, Cajamar - SP, Brasil</span>
              </p>
              <p className="uber-ajuda-valor">R$9,95</p>
              <div className="uber-ajuda-motorista">
                <span className="uber-ajuda-avatar" aria-hidden="true">
                  V
                </span>
                <span>Você avaliou Victor</span>
                <Estrelas />
              </div>
              <button type="button" className="uber-ajuda-recibo">
                Ver recibo
              </button>
            </div>
            <img className="uber-ajuda-mapa" src={MAPA} alt="" />
          </article>
        </section>

        <section className="uber-ajuda-bloco" aria-labelledby="ajuda-problemas">
          <h2 id="ajuda-problemas">Problemas com uma viagem específica e reembolsos</h2>
          <ul className="uber-ajuda-topicos">
            {TOPICOS.map(topico => (
              <li key={topico}>
                <button type="button">
                  <span>{topico}</span>
                  <IconChevron />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

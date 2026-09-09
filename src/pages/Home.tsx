import { Link } from "react-router";
import { Icon } from "../components/Icon";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          <span /> UM ESPAÇO, MUITAS POSSIBILIDADES
        </div>
        <h1>
          Menos complicação.
          <br />
          <span>Mais possibilidades.</span>
        </h1>
        <p>
          Seu conjunto de ferramentas para conectar trabalho, tempo
          <br className="desktop-break" /> e boas decisões. Tudo em um só lugar.
        </p>
        <a className="button primary" href="#tools">
          Explorar ferramentas <Icon name="arrow" />
        </a>
        <div className="orbit-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <span className="orbit-core">
            <Icon name="cloud" />
          </span>
          <span className="satellite sat-one">
            <Icon name="salary" />
          </span>
          <span className="satellite sat-two">
            <Icon name="clock" />
          </span>
          <span className="orbit-dot" />
        </div>
        <div className="hero-foot">
          <span>01 — SEU KIT DIGITAL</span>
          <span>Simples por natureza.</span>
        </div>
      </section>
      <section id="tools" className="tools-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FEITAS PARA O SEU DIA A DIA</span>
            <h2>Suas ferramentas</h2>
          </div>
          <span className="count">02 ferramentas disponíveis</span>
        </div>
        <div className="tool-grid">
          <Link to="/salary" className="tool-card salary-card">
            <div className="card-top">
              <span className="tool-icon">
                <Icon name="salary" />
              </span>
              <span className="badge available">Disponível</span>
            </div>
            <span className="mini-label">TRABALHO & FINANÇAS</span>
            <h3>Salário e moedas</h3>
            <p>
              Encontre o valor do seu trabalho. Compare remunerações por período
              e converta entre moedas.
            </p>
            <div className="tags">
              <span>Mensal ↔ hora</span>
              <span>BRL e outras moedas</span>
            </div>
            <div className="card-bottom">
              Abrir calculadora <Icon name="arrow" />
            </div>
          </Link>
          <Link to="/timezones" className="tool-card timezone-card">
            <div className="card-top">
              <span className="tool-icon">
                <Icon name="clock" />
              </span>
              <span className="badge available">Disponível</span>
            </div>
            <span className="mini-label">TEMPO & PRODUTIVIDADE</span>
            <h3>Fusos horários</h3>
            <p>
              Conecte horários, onde quer que você esteja. Planeje sua jornada e
              encontre espaço para trabalhar com o mundo.
            </p>
            <div className="tags">
              <span>Horários pelo mundo</span>
              <span>Jornada de trabalho</span>
            </div>
            <div className="card-bottom">
              Converter horários <Icon name="arrow" />
            </div>
          </Link>
        </div>
      </section>
      <section className="growth-note">
        <span className="growth-icon">+</span>
        <div>
          <h2>Um workspace que cresce com você.</h2>
          <p>
            Estas são as primeiras ferramentas. Novos utilitários vão chegar por
            aqui, um passo de cada vez.
          </p>
        </div>
        <span className="mini-label">SÓ O QUE É ÚTIL.</span>
      </section>
    </>
  );
}

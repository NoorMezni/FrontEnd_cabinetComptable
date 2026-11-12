
import { Link } from "react-router-dom";
import "../styles/Home.css";

const services = [
  {
    icon: "◈",
    title: "Gestion comptable",
    description:
      "Un suivi organisé des opérations comptables et des documents de votre entreprise.",
  },
  {
    icon: "↗",
    title: "Facturation",
    description:
      "Création, consultation et suivi des factures pour une meilleure visibilité sur vos paiements.",
  },
  {
    icon: "▤",
    title: "Gestion documentaire",
    description:
      "Centralisation et consultation de vos documents importants dans un espace sécurisé.",
  },
  {
    icon: "◷",
    title: "Suivi des missions",
    description:
      "Organisation des missions, suivi de leur avancement et gestion des échéances.",
  },
];

export default function Home() {
  return (
    <div className="home-page">

      {/* HEADER */}

      <header className="home-header">

        <Link to="/" className="home-brand">
          <span className="brand-symbol">C.</span>
          <span> CABINET COMPTABLE</span>
        </Link>

        <nav className="home-nav">
          <a href="#accueil">Accueil</a>
          <a href="#apropos">À propos</a>
          <a href="#services">Services</a>
          <a href="#engagements">Nos engagements</a>
          <a href="#contact">Contact</a>
        </nav>

        <Link to="/login" className="header-login">
          Se Connecter <span>↗</span>
        </Link>

      </header>

      <main>

        {/* HERO */}

        <section className="hero-section" id="accueil">

          <div className="hero-topline">
            <span>CABINET COMPTABLE</span>
            <span>VOTRE PARTENAIRE DE CONFIANCE</span>
          </div>

          <div className="hero-content">

            <div className="hero-text">

              <span className="hero-kicker">
                EXPERTISE COMPTABLE ET ACCOMPAGNEMENT
              </span>

              <h1>
                Une gestion
                <br />
                plus simple,
                <br />
                <span>un avenir plus clair.</span>
              </h1>

              <p>
                Nous accompagnons les entreprises dans leur gestion
                comptable et administrative en mettant à leur disposition
                des services adaptés et un espace numérique centralisé.
              </p>

              <div className="hero-actions">

                <Link to="/login" className="primary-button">
                  Accéder à mon espace <span>↗</span>
                </Link>

                <a href="#apropos" className="secondary-button">
                  Découvrir le cabinet
                </a>

              </div>

            </div>

          </div>

          <div className="hero-bottom">
            <span>Une gestion organisée au quotidien</span>
            <a href="#apropos">Découvrir ↓</a>
          </div>

        </section>

        {/* ABOUT */}

        <section className="about-section" id="apropos">

          <div className="section-topline">
            <span>À PROPOS DU CABINET</span>
          </div>

          <div className="about-content">

            <div className="about-title">

              <span className="section-kicker">
                QUI SOMMES-NOUS ?
              </span>

              <h2>
                Un cabinet
                <br />
                à vos côtés,
                <br />
                <span>au quotidien.</span>
              </h2>

            </div>

            <div className="about-text">

              <h3>
                Votre activité mérite une gestion claire et organisée.
              </h3>

              <p>
                Notre cabinet accompagne les entreprises et les
                professionnels dans leurs démarches comptables
                et administratives.
              </p>

              <p>
                Nous privilégions une approche basée sur l'écoute,
                la disponibilité et un suivi attentif de chaque dossier.
              </p>

              <p>
                Notre espace numérique vient compléter cet accompagnement
                en facilitant l'accès aux informations, aux documents
                et au suivi des différentes missions.
              </p>

              <Link to="/login" className="about-link">
                Accéder à votre espace <span>↗</span>
              </Link>

            </div>

          </div>

        </section>

        {/* SERVICES */}

        <section className="services-section" id="services">

          <div className="section-topline">
            <span>NOS SERVICES</span>
          </div>

          <div className="services-heading">

            <div>
              <span className="section-kicker">
                NOS DOMAINES D'INTERVENTION
              </span>

              <h2>
                Votre gestion,
                <br />
                <span>autrement.</span>
              </h2>
            </div>

            <p>
              Retrouvez les principales fonctionnalités de notre
              espace de gestion. Des outils conçus pour faciliter
              vos démarches et simplifier votre quotidien professionnel.
            </p>

          </div>

          <div className="services-grid">

            {services.map((service) => (

              <article className="service-card" key={service.title}>

                <div className="service-icon">
                  {service.icon}
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <span className="service-arrow">↗</span>

              </article>

            ))}

          </div>

        </section>

        {/* ENGAGEMENTS */}

        <section className="values-section" id="engagements">

          <div className="section-topline">
            <span>NOS ENGAGEMENTS</span>
          </div>

          <h2>
            Une relation basée
            <br />
            sur <span>la confiance.</span>
          </h2>

          <div className="values-grid">

            <article className="value-item">

              <h3>Rigueur</h3>

              <p>
                Des informations structurées et une attention
                particulière portée à chaque dossier.
              </p>

            </article>

            <article className="value-item">

              <h3>Transparence</h3>

              <p>
                Des échanges clairs et une meilleure visibilité
                sur vos documents et vos missions.
              </p>

            </article>

            <article className="value-item">

              <h3>Proximité</h3>

              <p>
                Un accompagnement humain et adapté aux besoins
                de chaque client.
              </p>

            </article>

          </div>

        </section>

        {/* CONTACT */}

        <section className="contact-section" id="contact">

          <div className="contact-content">

            <span className="section-kicker">
              RESTONS EN CONTACT
            </span>

            <h2>
              Simplifions
              <br />
              votre gestion.
            </h2>

            <p>
              Retrouvez votre espace personnel et accédez
              facilement aux différents services de notre cabinet.
            </p>

          </div>

          <Link to="/login" className="contact-button">
            Accéder à mon espace <span>↗</span>
          </Link>

        </section>

      </main>

      {/* FOOTER */}

      <footer className="home-footer">

        <Link to="/" className="footer-brand">
          <span className="brand-symbol">C.</span>
          CABINET COMPTABLE
        </Link>

        <p>
          © {new Date().getFullYear()} Cabinet Comptable.
          Tous droits réservés.
        </p>

        <Link to="/login">
          Se Connecter ↗
        </Link>

      </footer>

    </div>
  );
}

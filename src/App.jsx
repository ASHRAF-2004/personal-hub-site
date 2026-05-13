import { lazy, Suspense, useEffect } from 'react'
import ProjectCard from './components/ProjectCard.jsx'
import { projects } from './data/projects.js'
import { skillGroups } from './data/skills.js'

const Hero3DIDBadge = lazy(() => import('./components/Hero3DIDBadge.jsx'))

const links = {
  github: 'https://github.com/ASHRAF-2004',
  linkedin: 'https://www.linkedin.com/in/ashraf-ali-hussein/',
  portfolio: 'https://ashraf-2004.github.io/',
  email: 'mailto:thalththanwyd@gmail.com',
}

function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to Content
      </a>
      <nav className="nav-shell" aria-label="Primary">
        <a className="brand-mark" href="#hero" aria-label="Ashraf portfolio home">
          <span className="brand-dot" aria-hidden="true" />
          <span translate="no">ASHRAF</span>
        </a>
        <div className="nav-links">
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#resume">Resume</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero-section" id="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="role-line">Computer Science Student specializing in Software Engineering.</p>
        <h1 id="hero-title">Ashraf Ali Hussain Al-Saloul</h1>
        <p className="hero-lede">
          I build backend, C++, web, and applied machine-learning prototypes through academic and
          GitHub projects.
        </p>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="button button-primary" href="#projects">
            View Projects
          </a>
          <a className="button" href="/resume.pdf" download>
            Download Resume
          </a>
          <a className="button" href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="button" href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="button" href="#contact">
            Contact
          </a>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="badge-stage badge-loading" aria-label="Loading developer ID badge">
            <div className="loading-card">
              <span />
              <p>Loading 3D ID Badge</p>
            </div>
          </div>
        }
      >
        <Hero3DIDBadge />
      </Suspense>
    </section>
  )
}

function ProjectsSection() {
  return (
    <section className="section-block" id="projects" aria-labelledby="projects-title">
      <div className="section-heading">
        <span className="section-number" aria-hidden="true">
          01
        </span>
        <div>
          <h2 id="projects-title">Projects</h2>
          <p>
            Main academic and GitHub projects, written with careful status labels and supported
            claims.
          </p>
        </div>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="section-block about-layout" id="about" aria-labelledby="about-title">
      <div className="section-heading">
        <span className="section-number" aria-hidden="true">
          02
        </span>
        <div>
          <h2 id="about-title">About</h2>
          <p>Student-focused profile for internship applications.</p>
        </div>
      </div>
      <div className="about-copy">
        <p>
          I am a Computer Science student at Multimedia University, Cyberjaya Campus, completing a
          Bachelor of Computer Science (Hons.) with a Software Engineering specialization and
          expected graduation in October 2027.
        </p>
        <p>
          My current interests are software engineering, backend development, C++ systems, and
          applied machine-learning prototypes. I keep my portfolio centered on projects, readable
          source code, CV access, and contact paths that are easy for recruiters to scan.
        </p>
      </div>
    </section>
  )
}

function SkillsSection() {
  return (
    <section className="section-block" id="skills" aria-labelledby="skills-title">
      <div className="section-heading">
        <span className="section-number" aria-hidden="true">
          03
        </span>
        <div>
          <h2 id="skills-title">Skills</h2>
          <p>Grouped by the areas shown in the resume and project evidence.</p>
        </div>
      </div>
      <div className="skills-grid">
        {skillGroups.map((group) => (
          <article className="skill-group" key={group.label}>
            <h3>{group.label}</h3>
            <div className="tag-list">
              {group.skills.map((skill) => (
                <span className="skill-tag" key={skill} translate="no">
                  {skill}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ResumeSection() {
  return (
    <section className="section-block resume-panel" id="resume" aria-labelledby="resume-title">
      <div>
        <span className="section-number" aria-hidden="true">
          04
        </span>
        <h2 id="resume-title">Resume / CV</h2>
        <p>
          Download the updated resume files used for internship applications and ATS readability
          checks.
        </p>
      </div>
      <div className="resume-actions">
        <a className="button button-primary" href="/resume.pdf" download>
          Download Resume
        </a>
        <a className="button" href="/resume-ats-strict.pdf" download>
          Download ATS Strict Resume
        </a>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="section-block contact-layout" id="contact" aria-labelledby="contact-title">
      <div>
        <span className="section-number" aria-hidden="true">
          05
        </span>
        <h2 id="contact-title">Contact</h2>
        <p>
          For internship conversations, project review, or university-related technical work, these
          are the best links to use.
        </p>
      </div>
      <div className="contact-card">
        <a href={links.email}>thalththanwyd@gmail.com</a>
        <a href={links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn: ashraf-ali-hussein
        </a>
        <a href={links.github} target="_blank" rel="noreferrer">
          GitHub: ASHRAF-2004
        </a>
        <a href={links.portfolio} target="_blank" rel="noreferrer">
          Portfolio: ashraf-2004.github.io
        </a>
      </div>
    </section>
  )
}

function App() {
  useEffect(() => {
    if (!window.location.hash) return
    const target = document.querySelector(window.location.hash)
    target?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <ProjectsSection />
        <AboutSection />
        <SkillsSection />
        <ResumeSection />
        <ContactSection />
      </main>
      <footer className="site-footer">
        <span>Built for internship applications.</span>
        <span>Black minimalist React portfolio with a custom 3D developer ID badge.</span>
      </footer>
    </>
  )
}

export default App

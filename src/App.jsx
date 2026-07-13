import {
  Accessibility,
  ArrowDown,
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Download,
  Gauge,
  Layers3,
  Mail,
} from 'lucide-react'
import { useLayoutEffect, useState } from 'react'
import modernResumeUrl from './assets/docs/Ashraf_Modern_Resume.pdf'
import atsResumeUrl from './assets/docs/ATS_Resume.pdf'
import portraitUrl from './assets/ashraf-portrait.webp'
import Header from './components/Header.jsx'
import Hero3DIDBadge from './components/Hero3DIDBadge.jsx'
import ProjectCard from './components/ProjectCard.jsx'
import SectionHeading from './components/SectionHeading.jsx'
import { projects } from './data/projects.js'
import { skillGroups } from './data/skills.js'

const links = {
  github: 'https://github.com/ASHRAF-2004',
  linkedin: 'https://www.linkedin.com/in/ashraf-ali-hussein/',
  email: 'mailto:thalththanwyd@gmail.com',
}

const principles = [
  {
    icon: Accessibility,
    title: 'Usable by default',
    description:
      'Clear hierarchy, responsive layouts, keyboard access, and visible feedback are part of the interface from the start.',
  },
  {
    icon: Gauge,
    title: 'Performance with purpose',
    description:
      'Heavy features are deferred or simplified so the useful page arrives first and interaction stays comfortable.',
  },
  {
    icon: Layers3,
    title: 'Built to change',
    description:
      'Data, presentation, and behavior stay separated so the code remains understandable as a project grows.',
  },
]

function Hero() {
  return (
    <section className="hero-section" id="hero" aria-labelledby="hero-title">
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-shell">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span aria-hidden="true" />
            Computer Science student / Software Engineering
          </p>
          <h1 id="hero-title">Ashraf Ali Hussain Al-Saloul</h1>
          <p className="hero-lede">
            I create interactive websites and reliable software systems that feel clean,
            responsive, and comfortable to use.
          </p>
          <p className="hero-supporting">
            My focus is thoughtful user experience, visual clarity, performance, accessibility,
            and maintainable code.
          </p>
          <div className="hero-actions" aria-label="Primary portfolio actions">
            <a className="button button-primary" href="#projects">
              View projects
              <ArrowDown aria-hidden="true" />
            </a>
            <a
              className="button button-secondary"
              href={modernResumeUrl}
              download="Ashraf-Ali-Hussain-Al-Saloul-Resume.pdf"
            >
              <Download aria-hidden="true" />
              Download resume
            </a>
          </div>
          <div className="hero-social-links" aria-label="Professional profiles">
            <a href={links.github} target="_blank" rel="noreferrer">
              <Code2 aria-hidden="true" />
              View GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              <BriefcaseBusiness aria-hidden="true" />
              View LinkedIn
            </a>
            <a href="#contact">
              <Mail aria-hidden="true" />
              Contact me
            </a>
          </div>
        </div>

        <div className="hero-badge-wrap">
          <Hero3DIDBadge />
        </div>
      </div>

      <a className="next-section-link" href="#projects">
        <span>Selected work</span>
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  )
}

function ProjectsSection() {
  return (
    <section className="section section-projects" id="projects" aria-labelledby="projects-title">
      <div className="section-shell">
        <SectionHeading
          id="projects-title"
          eyebrow="Selected work"
          title="Projects with real constraints"
          description="A focused selection of academic and personal software work, presented with honest status and scope."
        />
        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PrinciplesSection() {
  return (
    <section className="section section-principles" aria-labelledby="principles-title">
      <div className="section-shell principles-layout">
        <SectionHeading
          id="principles-title"
          eyebrow="How I work"
          title="Good software should feel easy to use"
          description="The implementation matters, but so does the experience it creates for the person on the other side."
        />
        <div className="principles-list">
          {principles.map(({ icon: Icon, title, description }, index) => (
            <article className="principle-item" key={title}>
              <span className="principle-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="section section-about" id="about" aria-labelledby="about-title">
      <div className="section-shell about-layout">
        <div className="about-portrait">
          <img
            src={portraitUrl}
            alt="Ashraf Ali Hussain Al-Saloul"
            width="600"
            height="800"
            loading="lazy"
            decoding="async"
          />
          <span className="portrait-accent" aria-hidden="true" />
        </div>
        <div className="about-content">
          <SectionHeading
            id="about-title"
            eyebrow="About"
            title="Software engineering with the user in mind"
          />
          <div className="about-copy">
            <p>
              I am a Computer Science student at Multimedia University, Cyberjaya Campus,
              specializing in Software Engineering and expecting to graduate in October 2027.
            </p>
            <p>
              My work spans responsive web interfaces, backend applications, Java and C++ desktop
              systems, and an applied machine-learning research prototype. I enjoy connecting the
              technical details to an experience that is clear, reliable, and pleasant to use.
            </p>
          </div>
          <dl className="profile-facts">
            <div>
              <dt>Degree</dt>
              <dd>Bachelor of Computer Science (Hons.)</dd>
            </div>
            <div>
              <dt>Specialization</dt>
              <dd>Software Engineering</dd>
            </div>
            <div>
              <dt>Based at</dt>
              <dd>MMU Cyberjaya Campus</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function SkillsSection() {
  return (
    <section className="section section-skills" id="skills" aria-labelledby="skills-title">
      <div className="section-shell skills-layout">
        <SectionHeading
          id="skills-title"
          eyebrow="Toolkit"
          title="Skills used across my projects"
          description="Grouped by practical use rather than proficiency scores."
        />
        <div className="skills-list">
          {skillGroups.map((group) => (
            <article className="skill-group" key={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill} translate="no">
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ResumeSection() {
  return (
    <section className="section section-resume" id="resume" aria-labelledby="resume-title">
      <div className="section-shell resume-layout">
        <div>
          <p className="section-eyebrow">Resume</p>
          <h2 id="resume-title">A closer look at my education and project work</h2>
        </div>
        <div className="resume-copy">
          <p>
            Download the designed resume for a quick overview, or use the compact ATS version for
            text-first review.
          </p>
          <div className="resume-actions">
            <a
              className="button button-primary"
              href={modernResumeUrl}
              download="Ashraf-Ali-Hussain-Al-Saloul-Resume.pdf"
            >
              <Download aria-hidden="true" />
              Download resume
            </a>
            <a
              className="text-link"
              href={atsResumeUrl}
              download="Ashraf-Ali-Hussain-Al-Saloul-ATS-Resume.pdf"
            >
              ATS version
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="section section-contact" id="contact" aria-labelledby="contact-title">
      <div className="section-shell contact-layout">
        <div>
          <p className="section-eyebrow">Contact</p>
          <h2 id="contact-title">Let's build something useful</h2>
          <p>
            For internship opportunities, project discussions, or university-related technical
            work, email is the most direct way to reach me.
          </p>
        </div>
        <div className="contact-actions">
          <a className="contact-email" href={links.email}>
            <Mail aria-hidden="true" />
            <span>thalththanwyd@gmail.com</span>
          </a>
          <div className="contact-secondary">
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              <BriefcaseBusiness aria-hidden="true" />
              LinkedIn
            </a>
            <a href={links.github} target="_blank" rel="noreferrer">
              <Code2 aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  const [moonPhase, setMoonPhase] = useState(() => {
    try {
      return window.localStorage.getItem('portfolio-moon-phase') === 'new' ? 'new' : 'full'
    } catch {
      return 'full'
    }
  })

  useLayoutEffect(() => {
    document.documentElement.dataset.moonPhase = moonPhase
    try {
      window.localStorage.setItem('portfolio-moon-phase', moonPhase)
    } catch {
      // The visual preference still works when storage is unavailable.
    }
  }, [moonPhase])

  useLayoutEffect(() => {
    if (!window.location.hash) return
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <>
      <Header
        moonPhase={moonPhase}
        onMoonToggle={() => setMoonPhase((current) => (current === 'full' ? 'new' : 'full'))}
      />
      <main id="main" tabIndex="-1">
        <Hero />
        <ProjectsSection />
        <PrinciplesSection />
        <AboutSection />
        <SkillsSection />
        <ResumeSection />
        <ContactSection />
      </main>
      <footer className="site-footer">
        <div className="section-shell footer-layout">
          <a className="footer-brand" href="#hero">
            <Code2 aria-hidden="true" />
            Ashraf Al-Saloul
          </a>
          <p>Designed and built with React and Three.js.</p>
          <p>(c) {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  )
}

export default App

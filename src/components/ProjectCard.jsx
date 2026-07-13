import {
  AudioWaveform,
  CarFront,
  ChevronDown,
  Code2,
  Presentation,
  ScanText,
} from 'lucide-react'

const visualConfig = {
  audio: { Icon: AudioWaveform, label: 'Audio separation workflow' },
  parking: { Icon: CarFront, label: 'Parking operations workflow' },
  seminar: { Icon: Presentation, label: 'Seminar scheduling workflow' },
  ocr: { Icon: ScanText, label: 'Optical character recognition workflow' },
}

function ProjectVisual({ type }) {
  const { Icon, label } = visualConfig[type]

  return (
    <div className={`project-visual project-visual-${type}`} aria-hidden="true">
      <div className="project-visual-grid" />
      <span className="project-visual-icon">
        <Icon />
      </span>
      <span className="project-visual-label">{label}</span>
      <span className="project-visual-line project-visual-line-one" />
      <span className="project-visual-line project-visual-line-two" />
    </div>
  )
}

function ProjectCard({ project, index }) {
  return (
    <article className={`project-card ${project.featured ? 'project-card-featured' : ''}`}>
      <ProjectVisual type={project.visual} />
      <div className="project-card-body">
        <div className="project-card-meta">
          <span>{project.context}</span>
          <span aria-hidden="true">/</span>
          <span>{project.status}</span>
        </div>
        <p className="project-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3>{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <p className="project-contribution">
          <strong>My contribution</strong>
          <span>{project.contribution}</span>
        </p>

        <details className="project-details">
          <summary>
            <span>Key functionality</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <ul>
            {project.functionality.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>

        <div className="project-card-footer">
          <ul className="tag-list" aria-label={`${project.title} technology stack`}>
            {project.tech.map((item) => (
              <li key={item} translate="no">
                {item}
              </li>
            ))}
          </ul>
          <a className="project-link" href={project.github} target="_blank" rel="noreferrer">
            <Code2 aria-hidden="true" />
            View repository
          </a>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard

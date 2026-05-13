function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div className="project-card-top">
        <p className="project-status">{project.status}</p>
        <h3>{project.title}</h3>
      </div>
      <p>{project.description}</p>
      <div className="project-detail">
        <strong>Role</strong>
        <span>{project.role}</span>
      </div>
      <div className="project-detail">
        <strong>Highlight</strong>
        <span>{project.highlight}</span>
      </div>
      <div className="tag-list" aria-label={`${project.title} technology stack`}>
        {project.tech.map((item) => (
          <span className="skill-tag" key={item} translate="no">
            {item}
          </span>
        ))}
      </div>
      <div className="project-links">
        <a href={project.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        {project.live ? (
          <a href={project.live} target="_blank" rel="noreferrer">
            Live Site
          </a>
        ) : null}
      </div>
    </article>
  )
}

export default ProjectCard

function SectionHeading({ eyebrow, title, description, id, align = 'left' }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  )
}

export default SectionHeading

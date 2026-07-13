import { Code2, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import MoonToggle from './MoonToggle.jsx'

const navigationItems = [
  { href: '#projects', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#resume', label: 'Resume' },
  { href: '#contact', label: 'Contact' },
]

function Header({ moonPhase, onMoonToggle }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const menuRef = useRef(null)
  const menuToggleRef = useRef(null)

  useEffect(() => {
    const sections = [...document.querySelectorAll('main section[id]')]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)

        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -68% 0px', threshold: [0, 0.1, 0.35] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        menuToggleRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector('a')?.focus()
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const toggleMenu = () => setMenuOpen((current) => !current)

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav className="nav-shell" aria-label="Primary navigation">
        <a className="brand-mark" href="#hero" onClick={closeMenu} aria-label="Ashraf portfolio home">
          <span className="brand-monogram" aria-hidden="true">
            A
          </span>
          <span className="brand-name">Ashraf Al-Saloul</span>
        </a>

        <div
          ref={menuRef}
          className={`nav-menu ${menuOpen ? 'is-open' : ''}`}
          id="primary-menu"
        >
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              aria-current={activeSection === item.href.slice(1) ? 'location' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-actions">
          <a
            className="icon-button nav-github"
            href="https://github.com/ASHRAF-2004"
            target="_blank"
            rel="noreferrer"
            aria-label="View Ashraf's GitHub profile"
            title="GitHub profile"
          >
            <Code2 aria-hidden="true" />
          </a>
          <MoonToggle phase={moonPhase} onToggle={onMoonToggle} />
          <button
            ref={menuToggleRef}
            className="icon-button menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            onClick={toggleMenu}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Header

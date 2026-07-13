import moonFullUrl from '../assets/moon-full.webp'
import moonNewUrl from '../assets/moon-new.webp'

function MoonToggle({ phase, onToggle }) {
  const isNewMoon = phase === 'new'
  const currentPhase = isNewMoon ? 'new moon' : 'full moon'

  return (
    <button
      className="moon-toggle"
      type="button"
      onClick={onToggle}
      aria-label={`Change moon phase. Current phase: ${currentPhase}.`}
      aria-pressed={isNewMoon}
      title={`Change moon phase (currently ${currentPhase})`}
    >
      <span className="moon-toggle-image" aria-hidden="true">
        <img
          src={isNewMoon ? moonNewUrl : moonFullUrl}
          alt=""
          width="40"
          height="40"
          draggable="false"
        />
      </span>
    </button>
  )
}

export default MoonToggle

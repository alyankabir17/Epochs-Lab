import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import ThemeToggle from '../common/ThemeToggle'

function SocialButtons() {
  return <div className="auth-social-grid">
    <button type="button" className="auth-social-button">
      <span className="auth-social-glyph" aria-hidden="true">GH</span>
      Continue with GitHub
    </button>
    <button type="button" className="auth-social-button">
      <span className="auth-google-mark" aria-hidden="true">G</span>
      Continue with Google
    </button>
  </div>
}

export default function AuthShell({ title, description, children, footer }) {
  return <main className="auth-page">
    <div className="auth-page-toolbar">
      <Link to="/" className="auth-home-link" aria-label="Epochs Lab home"><Logo compact /></Link>
      <ThemeToggle />
    </div>
    <section className="auth-card" aria-labelledby="auth-heading">
      <div className="auth-brand">
        <Logo />
      </div>
      <div className="auth-heading">
        <h1 id="auth-heading">{title}</h1>
        <p>{description}</p>
      </div>
      {children}
      <div className="auth-divider"><span>or continue with</span></div>
      <SocialButtons />
      <p className="auth-footer">{footer}</p>
    </section>
  </main>
}

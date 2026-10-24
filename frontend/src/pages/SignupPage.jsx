import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return <AuthShell
    title="Create your account"
    description="Start turning datasets into trained models with Epochs Lab."
    footer={<><span>Already have an account?</span> <Link to="/login">Sign in</Link></>}
  >
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-field">
        <label htmlFor="signup-name">Full name</label>
        <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="Alyan Kabir" required />
      </div>
      <div className="auth-field">
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>
      <div className="auth-field">
        <label htmlFor="signup-password">Password</label>
        <div className="auth-password-wrap">
          <input id="signup-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" minLength="8" required />
          <button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
        <p className="auth-help">Use at least 8 characters.</p>
      </div>
      <button type="submit" className="auth-submit">Create account</button>
      {submitted && <p className="auth-demo-message" role="status">Demo mode: account creation is not connected yet.</p>}
    </form>
  </AuthShell>
}

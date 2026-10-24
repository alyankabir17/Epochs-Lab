import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const submit = (event) => {
    event.preventDefault()
    navigate('/app')
  }

  return <AuthShell
    title="Welcome back"
    description="Sign in to continue building your machine learning workflows."
    footer={<><span>Don’t have an account?</span> <Link to="/signup">Sign up</Link></>}
  >
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-field">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>
      <div className="auth-field">
        <div className="auth-label-row">
          <label htmlFor="login-password">Password</label>
          <a href="#forgot-password" className="auth-inline-link">Forgot password?</a>
        </div>
        <div className="auth-password-wrap">
          <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required />
          <button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <button type="submit" className="auth-submit">Sign in</button>
    </form>
  </AuthShell>
}

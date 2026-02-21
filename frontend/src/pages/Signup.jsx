import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const cardRef = useRef(null);
  const { signup, addActivity } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(cardRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(name, email, password);
      addActivity('Signed up and auto logged in');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-5 py-12">
      <form ref={cardRef} onSubmit={handleSubmit} className="glass-card w-full max-w-md p-7 md:p-8">
        <h1 className="text-3xl font-bold text-brand-text">Create Account</h1>
        <p className="mt-2 text-sm text-brand-muted">Start writing with AI in under a minute.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className="input-field"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="input-field"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="input-field"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary glow-button mt-6 w-full rounded-xl disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Signup & Continue'}
        </button>

        <p className="mt-4 text-sm text-brand-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;

'use client';

import React, { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';

const SiteActionsContext = createContext(null);
export function useSiteActions() {
  return useContext(SiteActionsContext);
}

export default function SiteShell({ children }) {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [formType, setFormType] = useState('Financing');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const openForm = (type = 'Financing') => {
    setFormType(type);
    setResult(null);
    setInquiryOpen(true);
    setMobileOpen(false);
  };

  async function submitLead(event) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.elements.consent.checked;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || 'We could not submit your request. Please try again.');
      setResult({ success: true, message: payload.message });
      form.reset();
    } catch (error) {
      setResult({
        success: false,
        message: error.message || 'We could not submit your request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteActionsContext.Provider value={{ openForm }}>
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>
            mineral<span className="brand-light">guide</span>
          </span>
        </Link>
        <nav className={mobileOpen ? 'nav open' : 'nav'}>
          <Link href="/learn" onClick={() => setMobileOpen(false)}>
            Learn
          </Link>
          <Link href="/tools" onClick={() => setMobileOpen(false)}>
            Tools
          </Link>
          <Link href="/learn" onClick={() => setMobileOpen(false)}>
            Ownership basics
          </Link>
          <button className="nav-cta" onClick={() => openForm()}>
            Explore your options <ArrowUpRight size={15} />
          </button>
        </nav>
        <button
          className="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>
      {children}
      <footer className="footer">
        <div className="wrap footer-top">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>
            <span>
              mineral<span className="brand-light">guide</span>
            </span>
          </Link>
          <span className="footer-tagline">Clarity for what’s beneath the surface.</span>
          <div className="footer-links">
            <Link href="/learn">Guides</Link>
            <Link href="/tools">Tools</Link>
            <button onClick={() => openForm()}>Contact</button>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2026 Mineral Guide. Educational resource.</span>
          <span>
            Information is general and not legal, tax, investment, or lending advice. Any financing
            referral may result in compensation.
          </span>
        </div>
      </footer>

      {inquiryOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setInquiryOpen(false);
          }}
        >
          <section
            className="inquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <button
              className="modal-close"
              aria-label="Close form"
              onClick={() => setInquiryOpen(false)}
            >
              <X size={20} />
            </button>
            {result?.success ? (
              <div className="success-state">
                <div className="success-icon">
                  <Check size={26} />
                </div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> REQUEST RECEIVED
                </div>
                <h2>Thanks for sharing.</h2>
                <p>{result.message}</p>
                <button className="button button-primary" onClick={() => setInquiryOpen(false)}>
                  Back to the guide <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="modal-kicker">A GOOD PLACE TO START</div>
                <h2 id="form-title">
                  Let’s understand
                  <br />
                  your situation.
                </h2>
                <p className="modal-intro">
                  Share a few details and choose what you’d like to explore.
                </p>
                <form onSubmit={submitLead}>
                  <div className="choice-row">
                    <button
                      type="button"
                      className={formType === 'Financing' ? 'choice active' : 'choice'}
                      onClick={() => setFormType('Financing')}
                    >
                      <CircleDollarSign size={17} /> Financing
                    </button>
                    <button
                      type="button"
                      className={formType === 'Purchase offer' ? 'choice active' : 'choice'}
                      onClick={() => setFormType('Purchase offer')}
                    >
                      <ArrowUpRight size={17} /> Purchase offer
                    </button>
                  </div>
                  <input type="hidden" name="interest" value={formType} />
                  <div className="form-grid">
                    <label>
                      First name
                      <input required name="firstName" maxLength="60" placeholder="First name" />
                    </label>
                    <label>
                      Last name
                      <input required name="lastName" maxLength="60" placeholder="Last name" />
                    </label>
                    <label className="wide">
                      Email address
                      <input
                        required
                        name="email"
                        type="email"
                        maxLength="254"
                        placeholder="you@example.com"
                      />
                    </label>
                    <label>
                      State
                      <select name="state" required defaultValue="">
                        <option value="" disabled>
                          Select state
                        </option>
                        {[
                          'Texas',
                          'Oklahoma',
                          'New Mexico',
                          'North Dakota',
                          'Pennsylvania',
                          'Other',
                        ].map((state) => (
                          <option key={state}>{state}</option>
                        ))}
                      </select>
                      <ChevronDown className="select-caret" size={15} />
                    </label>
                    <label>
                      What do you own?
                      <select name="ownership" required defaultValue="">
                        <option value="" disabled>
                          Select one
                        </option>
                        <option>Mineral rights</option>
                        <option>Oil and gas royalties</option>
                        <option>Not sure yet</option>
                      </select>
                      <ChevronDown className="select-caret" size={15} />
                    </label>
                    <label className="wide">
                      Anything else we should know?{' '}
                      <textarea
                        name="details"
                        rows="3"
                        maxLength="2000"
                        placeholder="A little context helps us point you in the right direction."
                      />
                    </label>
                    <label className="honeypot" aria-hidden="true">
                      Leave this field blank
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                  <label className="consent">
                    <input type="checkbox" name="consent" required />
                    <span>
                      I agree that Mineral Guide may share these details with a financing or mineral
                      purchase partner to respond to my inquiry.{' '}
                      <Link href="/privacy">Privacy details</Link>
                    </span>
                  </label>
                  {result && !result.success && (
                    <p className="form-error" role="alert">
                      {result.message}
                    </p>
                  )}
                  <button
                    className="button button-primary full submit-button"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending…' : 'Send inquiry'} <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </SiteActionsContext.Provider>
  );
}

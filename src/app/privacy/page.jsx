export const metadata = {
  title: 'Privacy',
  description: 'How Mineral Guide handles inquiry information and website analytics.',
};

export default function Page() {
  return (
    <main className="kb-article wrap">
      <div className="eyebrow">
        <span className="eyebrow-line" /> PRIVACY
      </div>
      <h1>Privacy notice</h1>
      <p className="kb-summary">Last updated November 16, 2026</p>
      <section>
        <h2>Information you submit</h2>
        <p>
          If you send an inquiry, Mineral Guide receives the details you provide, including your
          name, email address, state, information about your mineral or royalty interest, and any
          message you include. The website sends this information by email to the Mineral Guide
          team. The current site does not save inquiry submissions in a website database.
        </p>
      </section>
      <section>
        <h2>Website analytics</h2>
        <p>
          The site uses Vercel Web Analytics to understand visits and improve its pages. It records
          aggregated page-view information such as the page path, referring site, and general
          browser, device, operating-system, and location details. Vercel says Web Analytics does
          not use cookies and uses a daily request hash for visitor counts that expires after 24
          hours. The site also records whether an inquiry form was opened or successfully submitted,
          along with the selected inquiry type (financing or purchase offer). It also records when a
          calculator produces a result and which tool was used, but not the values entered. It does
          not send your name, email address, state, ownership details, or message as analytics event
          data. See Vercel's{' '}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            Web Analytics privacy information
          </a>{' '}
          for more detail.
        </p>
      </section>
      <section>
        <h2>How inquiries are used</h2>
        <p>
          We use inquiry information to respond to your request and, when you ask about financing or
          a purchase offer and consent to follow-up, to connect you with the relevant service
          provider. Mineral Guide may receive compensation when an inquiry results in a connection
          or transaction. The provider may use information under its own privacy practices.
        </p>
      </section>
      <section>
        <h2>Service providers and retention</h2>
        <p>
          Email delivery is handled by the service configured for the website. Messages may remain
          in email systems used to receive and respond to your inquiry. We retain those records as
          needed to handle the request, maintain business records, and meet legal obligations.
        </p>
      </section>
      <section>
        <h2>Your choices and contact</h2>
        <p>
          You can choose not to submit the inquiry form. For privacy questions or a request
          concerning information you submitted, contact{' '}
          <a href="mailto:info@mineralguide.us">info@mineralguide.us</a>.
        </p>
      </section>
      <section>
        <h2>Updates</h2>
        <p>
          This notice may be updated as the website and its services change. The date above
          indicates the latest revision.
        </p>
      </section>
    </main>
  );
}

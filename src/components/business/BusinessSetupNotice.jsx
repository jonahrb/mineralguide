export default function BusinessSetupNotice({ children }) {
  return (
    <section className="business-setup-notice">
      <strong>Business portal setup is incomplete.</strong>
      <p>{children}</p>
      <p>Configure the Supabase project and apply the migration before enabling account access.</p>
    </section>
  );
}

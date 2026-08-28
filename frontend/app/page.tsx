import { redirect } from "next/navigation";

import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="login-page">
      <section className="login-card">
        <span className="login-mark">✓</span>
        <p className="login-brand">Todo List</p>
        <h1>Keep track of your todos.</h1>
        <p>Log in to see your list.</p>
        <a className="login-button" href="/auth/login?returnTo=/dashboard">
          Log in
        </a>
        <small>New here? You can create an account on the next screen.</small>
      </section>
    </main>
  );
}

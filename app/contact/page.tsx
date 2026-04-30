import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Contact us</h1>
          <p className="mt-4 text-muted-foreground">
            Book a demo or ask about Enterprise plans. We&apos;ll get back to you within 24 hours.
          </p>
          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left">
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90"
              >
                Send message
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Or email us at{" "}
              <a href="mailto:hello@setupai.in" className="text-primary hover:underline">
                hello@setupai.in
              </a>
            </p>
          </div>
          <p className="mt-6">
            <Link href="/" className="text-primary hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

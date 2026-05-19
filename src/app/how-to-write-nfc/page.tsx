import Link from 'next/link'

export default function HowToWriteNFCPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              How to Write Your NFC Tag
            </h1>

            <p className="mt-2 text-sm text-white/80">
              Follow these steps to connect your NFC tag to your business page.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#2b211b]"
          >
            Back to Dashboard
          </Link>
        </div>

        <section className="rounded-[28px] bg-white/95 p-6 shadow-2xl sm:p-8">
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#d8c7b8] bg-[#f5efe8] p-5">
              <h2 className="text-xl font-bold text-[#2b211b]">
                What you need
              </h2>

              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[#8f6d4e]">
                <li>Your NFC tag or NFC card</li>
                <li>Your public page link from the dashboard</li>
                <li>An NFC writer app on your phone</li>
                <li>A phone with NFC enabled</li>
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <StepCard
                number="1"
                title="Copy your page link"
                text="Go to Dashboard, open My Pages, and click Copy Link for the page you want to connect to the NFC tag."
              />

              <StepCard
                number="2"
                title="Install an NFC writer app"
                text="On iPhone or Android, install an app such as NFC Tools. Open the app after installation."
              />

              <StepCard
                number="3"
                title="Choose Write URL"
                text="In the NFC app, choose Write, Add a record, then select URL or Website."
              />

              <StepCard
                number="4"
                title="Paste your page link"
                text="Paste the public link copied from your dashboard, then confirm the URL record."
              />

              <StepCard
                number="5"
                title="Write to the NFC tag"
                text="Tap Write, then hold your phone close to the NFC tag until the app confirms it was written successfully."
              />

              <StepCard
                number="6"
                title="Test the tag"
                text="Use another phone to tap the NFC tag. It should open your public business page automatically."
              />
            </div>

            <div className="rounded-2xl bg-[#2b211b] p-5 text-white">
              <h2 className="text-xl font-bold">
                Important tips
              </h2>

              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-white/80">
                <li>Make sure your page is published before writing the NFC tag.</li>
                <li>Test the copied link in a browser before writing it.</li>
                <li>If the tag does not open, check that NFC is enabled on the phone.</li>
                <li>For printed flyers, use the QR code as a backup if NFC is unavailable.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-[#d8c7b8] bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2b211b] text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="text-lg font-bold text-[#2b211b]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#8f6d4e]">
        {text}
      </p>
    </div>
  )
}
import Link from "next/link";

export default async function BillingReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const status = (resolvedSearchParams?.status ?? "").toLowerCase();
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      {status === "success" ? (
        <>
          <h1 className="text-2xl font-extrabold">Subscription activated</h1>
          <p className="text-fg/70 mt-2">
            Thanks for upgrading! Your premium features will unlock shortly.
          </p>
          <Link href="/" className="bg-brand mt-6 inline-block rounded-md px-4 py-2 text-white">
            Go to dashboard
          </Link>
        </>
      ) : status === "canceled" ? (
        <>
          <h1 className="text-2xl font-extrabold">Checkout canceled</h1>
          <p className="text-fg/70 mt-2">No charges were made. You can try again anytime.</p>
          <Link
            href="/pricing"
            className="border-brand text-brand mt-6 inline-block rounded-md border px-4 py-2"
          >
            Back to Pricing
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold">Checkout</h1>
          <p className="text-fg/70 mt-2">We couldn&apos;t determine your checkout status.</p>
          <Link
            href="/pricing"
            className="border-brand text-brand mt-6 inline-block rounded-md border px-4 py-2"
          >
            Back to Pricing
          </Link>
        </>
      )}
    </main>
  );
}

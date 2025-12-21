export default function BillingReturnPage({searchParams}: { searchParams: { status?: string } }) {
    const status = (searchParams?.status ?? '').toLowerCase();
    return (
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
            {status === 'success' ? (
                <>
                    <h1 className="text-2xl font-extrabold">Subscription activated</h1>
                    <p className="mt-2 text-fg/70">Thanks for upgrading! Your premium features will unlock shortly.</p>
                    <a href="/" className="mt-6 inline-block rounded-md bg-brand px-4 py-2 text-white">Go to
                        dashboard</a>
                </>
            ) : status === 'canceled' ? (
                <>
                    <h1 className="text-2xl font-extrabold">Checkout canceled</h1>
                    <p className="mt-2 text-fg/70">No charges were made. You can try again anytime.</p>
                    <a href="/pricing"
                       className="mt-6 inline-block rounded-md border border-brand px-4 py-2 text-brand">Back to
                        Pricing</a>
                </>
            ) : (
                <>
                    <h1 className="text-2xl font-extrabold">Checkout</h1>
                    <p className="mt-2 text-fg/70">We couldn’t determine your checkout status.</p>
                    <a href="/pricing"
                       className="mt-6 inline-block rounded-md border border-brand px-4 py-2 text-brand">Back to
                        Pricing</a>
                </>
            )}
        </main>
    );
}

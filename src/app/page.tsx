import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700 mb-6">
          <span>🎯</span> Stop applying blindly
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight max-w-2xl">
          Find internships.{" "}
          <span className="text-blue-600">Know your odds.</span>
        </h1>

        <p className="mt-4 text-lg text-gray-500 max-w-xl">
          A ranked feed of internships with a{" "}
          <strong className="text-gray-700">Leverage Score</strong> that tells
          you if you&apos;re Cold ❄️, Warm ✨, or Hot 🔥 for each role — so
          you apply to the right ones first.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/feed"
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors text-sm"
          >
            View My Feed →
          </Link>
          <Link
            href="/profile"
            className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Set Up Profile
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-16">
        <FeatureCard
          icon="🔥"
          title="Ranked Feed"
          description="Not a list. A prioritized stack. Know exactly what to apply to first."
        />
        <FeatureCard
          icon="🧠"
          title="Leverage Score"
          description="Cold, Warm, or Hot — based on your skills, connections, and role fit."
        />
        <FeatureCard
          icon="📋"
          title="Application Tracker"
          description="Track where you applied, your status, and notes — all in one place."
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

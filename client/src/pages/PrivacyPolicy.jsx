import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AgentFlowLogo from "../components/AgentFlowLogo";
import usePageMeta from "../hooks/usePageMeta";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  usePageMeta({
    title: "Privacy Policy — AgentFlow",
    description:
      "Learn how AgentFlow collects, uses, and safeguards your personal data, AI prompts, and code sandboxes.",
    keywords:
      "AgentFlow privacy policy, data security, AI privacy, user data rights, encryption",
  });

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-white selection:bg-white/20 selection:text-white retro-grid">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <AgentFlowLogo size={22} />
            <span className="font-mono text-sm font-semibold tracking-tight text-white group-hover:text-gray-200">
              AgentFlow
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Privacy Policy
          </h1>
          <p className="mt-1.5 text-xs text-gray-500">
            Last Updated: October 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="space-y-7 rounded-xl border border-white/10 bg-[#141416]/90 p-6 sm:p-8 text-gray-300 text-sm leading-relaxed backdrop-blur-sm shadow-xl">
          {/* Section 1 */}
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              1. Information We Collect
            </h2>
            <p className="text-xs text-gray-400">
              When you use AgentFlow, we collect information required to operate and maintain your workspaces:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-400">
              <li>
                <strong className="text-gray-200">Account Data:</strong> Name, email address, and profile photo provided via Google authentication.
              </li>
              <li>
                <strong className="text-gray-200">Workflow &amp; Prompt Inputs:</strong> Prompts, queries, uploaded files, and search requests you submit.
              </li>
              <li>
                <strong className="text-gray-200">Generated Artifacts:</strong> Code sandboxes, presentations, and search digests created in your sessions.
              </li>
              <li>
                <strong className="text-gray-200">Billing Information:</strong> Payment status and credit balances processed securely via Razorpay. We do not store raw payment card numbers.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              2. How We Use Information
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-400">
              <li>Processing workflow requests, code sandboxes, and search tasks.</li>
              <li>Managing your conversation history and credit allocations.</li>
              <li>Preventing automated abuse and protecting service reliability.</li>
              <li>We do not sell your personal data to advertisers or third parties.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              3. AI Providers &amp; External APIs
            </h2>
            <p className="text-xs text-gray-400">
              Requests are routed to trusted model providers (such as Google Gemini, OpenAI, and search providers) to execute workflows. Data is handled under developer agreements designed to protect prompt confidentiality.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              4. Data Security &amp; Storage
            </h2>
            <p className="text-xs text-gray-400">
              We apply standard industry security practices including HTTPS/TLS in transit, token-based authentication, and protected databases.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              5. User Control &amp; Deletion
            </h2>
            <p className="text-xs text-gray-400">
              You can delete individual conversations and artifacts directly from your sidebar at any time. For complete account removal, contact our support team.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2.5 border-t border-white/10 pt-5">
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              6. Contact
            </h2>
            <p className="text-xs text-gray-400">
              Questions regarding privacy can be directed to:
            </p>
            <p className="font-mono text-xs text-white">
              support@agentflow.ai
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between text-xs font-mono text-gray-500">
          <span>&copy; {new Date().getFullYear()} AgentFlow</span>
          <button
            type="button"
            onClick={() => navigate("/terms")}
            className="hover:text-white transition cursor-pointer underline"
          >
            Terms &amp; Conditions &rarr;
          </button>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

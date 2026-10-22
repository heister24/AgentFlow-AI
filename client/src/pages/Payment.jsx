import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  Loader2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import createOrder from "../features/createOrder";
import verifyPayment from "../features/verifyPayment";
import getCurrentUser from "../features/getCurrentUser";
import { setUserData } from "../redux/slices/userSlice";

// eslint-disable-next-line react-refresh/only-export-components
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    amount: 0,
    credits: 100,
    validity: 30,
  },
  basic: {
    id: "basic",
    name: "Basic",
    amount: 299,
    credits: 500,
    validity: 30,
  },
  plus: {
    id: "plus",
    name: "Plus",
    amount: 499,
    credits: 1000,
    validity: 30,
  },
};

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) dispatch(setUserData(user));
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    fetchUser();
  }, [dispatch]);

  const plans = [
    {
      ...PLANS.free,
      description: "Basic access for standard conversation and tests.",
      features: [
        "100 credits included",
        "Chat access",
        "Standard response speed",
        "30-day validity",
      ],
    },
    {
      ...PLANS.basic,
      description: "For everyday tasks and multimodal workflows.",
      features: [
        "500 credits included",
        "All specialized agents",
        "Image, PDF & PPT generation",
        "Code sandbox execution",
        "30-day validity",
      ],
    },
    {
      ...PLANS.plus,
      description: "For power users requiring high credit volume.",
      features: [
        "1,000 credits included",
        "Priority processing",
        "Unlimited sandbox previews",
        "Advanced multimodal tools",
        "30-day validity",
      ],
      popular: true,
    },
  ];

  const handleSelectPlan = async (plan) => {
    if (plan.amount === 0) return;

    try {
      setLoadingPlan(plan.id);
      setStatusMessage(null);

      setStatusMessage({
        type: "info",
        text: `Opening payment for ${plan.name} (₹${plan.amount})...`,
      });

      const response = await createOrder(plan);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_TEST_API_KEY,
        amount: response.order.amount,
        currency: response.order.currency,
        name: "AgentFlow-AI",
        description: `${response.plan.name} Plan (${response.plan.credits} Credits)`,
        order_id: response.order.id,
        handler: async (paymentRes) => {
          try {
            setStatusMessage({
              type: "info",
              text: "Verifying your payment...",
            });

            const res = await verifyPayment(
              paymentRes.razorpay_order_id,
              paymentRes.razorpay_payment_id,
              paymentRes.razorpay_signature,
            );

            if (res && res.success !== false) {
              const updatedUser = await getCurrentUser();
              if (updatedUser) dispatch(setUserData(updatedUser));
              setStatusMessage({
                type: "success",
                text: "Payment successful! Your credits and plan have been updated.",
              });
            } else {
              setStatusMessage({
                type: "error",
                text: res?.message || "Payment verification failed.",
              });
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setStatusMessage({
              type: "error",
              text: "Unable to verify payment. Please contact support if your account was charged.",
            });
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setStatusMessage({
        type: "error",
        text: "Unable to initialize payment. Please try again.",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const userCurrentPlanId = userData?.plan?.toLowerCase() || "free";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-5 sm:p-10 flex flex-col justify-between">
      {/* Top Nav */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>

        {userData && (
          <div className="text-xs text-gray-400">
            <span>Balance: </span>
            <span className="font-semibold text-white">
              {(userData.credits ?? 100).toLocaleString("en-IN")}
            </span>
            <span> credits</span>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto my-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Plans & Pricing
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Simple and transparent credit plans. Cancel anytime.
          </p>

          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`mt-4 max-w-lg mx-auto flex items-center gap-2.5 rounded-xl border px-4 py-2 text-xs font-medium text-left shadow-lg ${
                statusMessage.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : statusMessage.type === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-300"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              ) : statusMessage.type === "error" ? (
                <AlertCircle size={15} className="shrink-0 text-red-400" />
              ) : (
                <Loader2 size={15} className="shrink-0 animate-spin text-blue-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = userCurrentPlanId === plan.id;
            const isLoading = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-6 transition-colors ${
                  plan.popular
                    ? "border-white/20 bg-[#161618]"
                    : "border-white/10 bg-[#141416]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">
                    {plan.name}
                  </h3>
                  {plan.popular ? (
                    <span className="rounded-md border border-white/20 px-1.5 py-0.5 text-[10px] text-gray-300">
                      Popular
                    </span>
                  ) : isCurrent ? (
                    <span className="rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] text-gray-400">
                      Active
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-gray-400 mt-2 min-h-8">
                  {plan.description}
                </p>

                <div className="my-5">
                  <span className="text-3xl font-bold tracking-tight">
                    ₹{plan.amount}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    / {plan.validity} days
                  </span>
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2.5 text-xs text-gray-300"
                    >
                      <Check size={13} className="text-gray-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isCurrent || plan.amount === 0 || isLoading}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-white/5 text-gray-500 cursor-default"
                      : plan.popular
                        ? "bg-white text-black hover:bg-gray-200 cursor-pointer active:scale-95"
                        : plan.amount === 0
                          ? "bg-white/5 text-gray-400 cursor-default"
                          : "border border-white/15 bg-white/10 text-white hover:bg-white/15 cursor-pointer active:scale-95"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isCurrent ? (
                    <span>Current Plan</span>
                  ) : plan.amount === 0 ? (
                    <span>Free</span>
                  ) : (
                    <span>Upgrade to {plan.name}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-gray-400" />
            <span>Secure Razorpay Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-gray-400" />
            <span>Instant Credit Delivery</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-gray-600 mt-8">
        AgentFlow-AI
      </div>
    </div>
  );
};

export default Payment;

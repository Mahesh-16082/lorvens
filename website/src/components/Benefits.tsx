const benefits = [
  {
    icon: "♛",
    title: "Exclusive Free Stays",
    description:
      "All Club Members can enjoy a complimentary 3-day stay with their family once every year.",
  },
  {
    icon: "📅",
    title: "Preferred Bookings",
    description:
      "Advance reservation windows for club events, stays and exclusive services.",
  },
  {
    icon: "%",
    title: "Member Discounts",
    description:
      "Special member rates and discounts on dining, stays and recreational activities.",
  },
  {
    icon: "🎧",
    title: "Dedicated Support",
    description:
      "Personalized customer support for all member assistance and inquiries.",
  },
  {
    icon: "🎁",
    title: "Referral Rewards Program",
    description:
      "Earn exclusive member rewards and club vouchers for every successful new member referral.",
  },
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="bg-[linear-gradient(135deg,#0a3029,#103f36_55%,#082820)] py-[90px] text-white max-[700px]:py-[58px] max-[420px]:py-[48px]"
    >
      <div className="mx-auto w-[min(1180px,92%)] text-center max-[700px]:w-[calc(100%-32px)] max-[420px]:w-[calc(100%-24px)]">
        <div className="text-[12px] font-bold tracking-[3px] text-[#f0cf78] max-[420px]:text-[10px] max-[420px]:tracking-[2px]">
          MEMBERSHIP EXPERIENCE
        </div>

        <h2 className="my-[10px] mb-[16px] font-[Georgia,Times_New_Roman,serif] text-[48px] font-bold leading-[1.1] text-white max-[700px]:!text-[34px] max-[700px]:!leading-[1.15] max-[420px]:!text-[30px]">
          Club Benefits &amp; Privileges
        </h2>

        <p className="mx-auto mb-[42px] max-w-[720px] text-[16px] text-[#d4e0dc] max-[700px]:mb-[28px] max-[700px]:px-[4px] max-[700px]:text-[14px]">
          A Lorvens Club membership is designed to offer priority, convenience,
          savings and rewarding experiences across the club lifestyle.
        </p>

        <div className="grid grid-cols-5 gap-[16px] max-[900px]:grid-cols-3 max-[700px]:grid-cols-1 max-[700px]:gap-[12px]">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="min-h-[295px] rounded-[8px] border border-[rgba(240,207,120,0.35)] bg-[rgba(255,255,255,0.06)] px-[20px] py-[28px] text-center max-[700px]:min-h-0 max-[700px]:px-[18px] max-[700px]:py-[24px]"
            >
              <div className="mx-auto mb-[18px] grid h-[64px] w-[64px] place-items-center rounded-full border border-[rgba(240,207,120,0.45)] bg-[rgba(201,152,46,0.16)] text-[26px] text-[#f0cf78]">
                {benefit.icon}
              </div>

              <h3 className="mb-[14px] font-[Georgia,Times_New_Roman,serif] text-[22px] font-bold leading-[1.15] text-white max-[700px]:text-[21px]">
                {benefit.title}
              </h3>

              <p className="m-0 text-[14px] text-[#d5e0dc]">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const amenities = [
  { icon: "🏋️", title: "GYM" },
  { icon: "🍽️", title: "BANQUET HALL" },
  { icon: "🚶", title: "WALKING TRACK" },
  { icon: "🛝", title: "OUTDOOR CHILDREN PLAY AREA" },
  { icon: "🏊", title: "SWIMMING POOL" },
  { icon: "🍴", title: "RESTAURANT" },
  { icon: "🏓", title: "INDOOR GAMES ZONE" },
  { icon: "🅿️", title: "AMPLE PARKING" },
  { icon: "🛡️", title: "24/7 SECURITY" },
  { icon: "📹", title: "CCTV SURVEILLANCE" },
  { icon: "🌿", title: "KERALA DETOXIFICATION CENTRE" },
  { icon: "🥗", title: "ORGANIC FOOD CENTRE" },
  { icon: "🥛", title: "A2 MILK CENTRE" },
  { icon: "💧", title: "ALKALINE WATER PLANT" },
  { icon: "⚡", title: "EV BATTERY RECHARGE STATION" },
  { icon: "🏏", title: "OUTDOOR GAMES" },
  { icon: "🌱", title: "MEDICINAL PLANTS" },
  { icon: "💼", title: "BUSINESS LOUNGE" },
];

export default function Amenities() {
  return (
    <section
      id="amenities"
      className="bg-[#f7f3ea] py-[90px] max-[700px]:py-[58px] max-[420px]:py-[48px]"
    >
      <div className="mx-auto w-[min(1180px,92%)] text-center max-[700px]:w-[calc(100%-32px)] max-[420px]:w-[calc(100%-24px)]">
        <div className="text-[12px] font-bold tracking-[3px] text-[#c99a2e] max-[420px]:text-[10px] max-[420px]:tracking-[2px]">
          A COMPLETE CLUB EXPERIENCE
        </div>

        <h2 className="my-[10px] font-[Georgia,Times_New_Roman,serif] text-[48px] font-bold leading-[1.1] text-[#113b34] max-[700px]:!text-[34px] max-[700px]:!leading-[1.15] max-[420px]:!text-[30px]">
          Wellness, Leisure &amp; More
        </h2>

        <div className="mt-[44px] grid grid-cols-6 gap-[14px] max-[900px]:grid-cols-3 max-[700px]:mt-[30px] max-[700px]:grid-cols-2 max-[700px]:gap-[10px] max-[420px]:gap-[8px]">
          {amenities.map((amenity) => (
            <div
              key={amenity.title}
              className="flex min-h-[126px] flex-col items-center justify-center rounded-[8px] border border-[#eadfca] bg-[#fffdf8] px-[12px] py-[22px] text-center max-[700px]:min-h-[112px] max-[700px]:px-[8px] max-[700px]:py-[16px] max-[420px]:min-h-[105px]"
            >
              <div className="mb-[10px] text-[28px] [filter:saturate(.8)] max-[700px]:mb-[8px] max-[700px]:text-[25px]">
                {amenity.icon}
              </div>

              <h3 className="m-0 font-[Arial,sans-serif] text-[11px] font-bold tracking-[0.8px] text-[#113b34] max-[700px]:text-[10px] max-[700px]:leading-[1.35]">
                {amenity.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

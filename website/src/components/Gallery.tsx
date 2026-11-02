const gallery = [
  {
    layout: "reception",
    src: "/assets/gallery-lobby.png",
    alt: "Lorvens Club luxury reception and lobby",
    title: "Club Reception",
  },
  {
    layout: "gym",
    src: "/assets/gallery-gym.png",
    alt: "Lorvens Club modern gym",
    title: "Fitness Centre",
  },
  {
    layout: "pool",
    src: "/assets/gallery-pool.png",
    alt: "Lorvens Club indoor swimming pool",
    title: "Swimming Pool",
  },
  {
    layout: "restaurant",
    src: "/assets/gallery-restaurant.png",
    alt: "Lorvens Club restaurant",
    title: "Fine Dining",
  },
  {
    layout: "games",
    src: "/assets/gallery-games.png",
    alt: "Lorvens Club indoor games room",
    title: "Indoor Games",
  },
  {
    layout: "cinema",
    src: "/assets/gallery-lounge.png",
    alt: "Lorvens Club business lounge",
    title: "Business Lounge",
  },
  {
    layout: "spa",
    src: "/assets/hero-club-exterior.png",
    alt: "Lorvens Club exterior at night",
    title: "Lorvens Club",
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="bg-[#082e28] py-[90px] text-white max-[700px]:py-[58px] max-[420px]:py-[48px]"
    >
      <div className="mx-auto w-[min(1180px,92%)] text-center max-[700px]:w-[calc(100%-32px)] max-[420px]:w-[calc(100%-24px)]">
        <div className="text-[12px] font-bold tracking-[3px] text-[#f0cf78] max-[420px]:text-[10px] max-[420px]:tracking-[2px]">
          A GLIMPSE INTO THE LORVENS LIFESTYLE
        </div>

        <h2 className="my-[10px] mb-[10px] font-[Georgia,Times_New_Roman,serif] text-[48px] font-bold leading-[1.1] text-white max-[700px]:!text-[34px] max-[700px]:!leading-[1.15] max-[420px]:!text-[30px]">
          Discover the Lorvens Experience
        </h2>

        <p className="mx-auto mb-[40px] max-w-[760px] text-[16px] text-[#b9c8c3] max-[700px]:mb-[30px] max-[700px]:text-[14px]">
          Explore the premium spaces of Lorvens Club — from elegant arrivals
          and fitness to leisure, dining and recreation.
        </p>

        <div className="grid grid-cols-12 auto-rows-[230px] gap-[16px] max-[900px]:grid-cols-2 max-[900px]:auto-rows-[220px] max-[900px]:gap-[14px] max-[700px]:grid-cols-1 max-[700px]:auto-rows-[210px] max-[700px]:gap-[12px]">
          {gallery.map((item) => (
            <article
              key={item.layout}
              className={`group relative ${
                item.layout === "games" ||
                item.layout === "cinema" ||
                item.layout === "spa"
                  ? "col-span-4"
                  : "col-span-6"
              } overflow-hidden rounded-[10px] bg-[#0b2d27] shadow-[0_18px_38px_rgba(0,0,0,0.28)] max-[900px]:col-span-1 max-[700px]:rounded-[8px]`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="block h-full w-full object-cover transition-transform duration-[450ms] ease-in-out group-hover:scale-[1.035]"
              />

              <span className="absolute bottom-[14px] left-[16px] rounded-[3px] border border-[rgba(240,207,120,0.45)] bg-[rgba(5,27,23,0.78)] px-[12px] py-[7px] text-[11px] uppercase tracking-[1.4px] text-[#f4d27a] max-[700px]:bottom-[12px] max-[700px]:left-[12px] max-[700px]:px-[9px] max-[700px]:py-[6px] max-[700px]:text-[10px]">
                {item.title}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

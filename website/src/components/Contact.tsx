export default function Contact() {
  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-[#f7f3ea] py-[86px] text-[#183a34] max-[900px]:py-[68px] max-[700px]:py-[58px] max-[420px]:py-[48px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(201,154,46,0.10),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(13,58,52,0.05),transparent_24%)]"
      />

      <div className="relative z-10 mx-auto grid w-[min(1180px,92%)] grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] items-stretch gap-[58px] max-[900px]:grid-cols-1 max-[900px]:gap-[24px] max-[700px]:w-[calc(100%-32px)] max-[420px]:w-[calc(100%-24px)]">
        <div>
          <div className="text-[12px] font-bold tracking-[3px] text-[#c99a2e] max-[420px]:text-[10px] max-[420px]:tracking-[2px]">
            MEMBERSHIP ENQUIRIES
          </div>

          <h2 className="my-[12px] mb-[22px] max-w-[760px] font-[Georgia,Times_New_Roman,serif] text-[clamp(38px,5vw,58px)] font-bold leading-[1.08] text-[#123b34] max-[700px]:!text-[34px] max-[700px]:!leading-[1.15] max-[420px]:!text-[30px]">
            Be Among the First to Experience Lorvens Club
          </h2>

          <p className="mb-[14px] max-w-[720px] text-[16px] text-[#52635f] max-[700px]:text-[15px] max-[700px]:leading-[1.65]">
            This is a coming soon project. Connect with us for membership
            information, launch updates and exclusive early access
            opportunities.
          </p>

          <p className="mb-[14px] max-w-[720px] text-[16px] text-[#52635f] max-[700px]:text-[15px] max-[700px]:leading-[1.65]">
            <strong className="font-bold tracking-[0.4px] text-[#111]">
              Website:
            </strong>{" "}
            <a
              href="https://www.lorvensclub.com"
              className="break-words text-[#111] underline-offset-2 hover:underline"
            >
              www.lorvensclub.com
            </a>
          </p>

          <p className="mb-[14px] max-w-[720px] text-[16px] text-[#52635f] max-[700px]:text-[15px] max-[700px]:leading-[1.65]">
            <strong className="font-bold tracking-[0.4px] text-[#111]">
              Email:
            </strong>{" "}
            <a
              href="mailto:support@lorvensclub.com"
              className="break-words text-[#111] underline-offset-2 hover:underline"
            >
              support@lorvensclub.com
            </a>
          </p>
        </div>

        <div className="flex h-full flex-col justify-center rounded-[12px] border border-[rgba(240,207,120,0.38)] bg-[linear-gradient(145deg,#0a3029,#061d1a)] px-[34px] pt-[34px] pb-[28px] text-white shadow-[0_20px_48px_rgba(0,0,0,0.22)] max-[900px]:min-h-0 max-[700px]:rounded-[10px] max-[700px]:px-[22px] max-[700px]:py-[28px] max-[420px]:px-[18px] max-[420px]:py-[24px]">
          <h3 className="mt-0 mb-[14px] font-[Georgia,Times_New_Roman,serif] text-[28px] font-bold tracking-[2px] text-[#f0cf78] max-[700px]:!text-[26px]">
            COMING SOON
          </h3>

          <p className="mb-[14px] text-[16px] text-[#d7e1dd] max-[700px]:text-[15px] max-[700px]:leading-[1.65]">
            A privileged destination is taking shape in Tirupati.
          </p>

          <p className="mb-[14px] text-[16px] text-[#d7e1dd] max-[700px]:text-[15px] max-[700px]:leading-[1.65]">
            <strong className="font-bold tracking-[0.4px] text-[#f0cf78]">
              LORNVENS CLUB
            </strong>
            <br />
            S.No: 383, Vemuru,
            <br />
            Tirupati -517503,
            <br />
            Andhra Pradesh.
          </p>

          <p className="mb-[14px] text-[16px] text-[#d7e1dd] max-[700px]:text-[15px] max-[700px]:leading-[1.65]">
            <a
              href="https://www.lorvensclub.com"
              className="break-words text-[#f0cf78] underline-offset-2 hover:underline"
            >
              www.lorvensclub.com
            </a>
            <br />
            <a
              href="mailto:support@lorvensclub.com"
              className="break-words text-[#f0cf78] underline-offset-2 hover:underline"
            >
              support@lorvensclub.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

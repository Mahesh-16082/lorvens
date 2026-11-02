function Membership() {
  return (
    <section
      id="cards"
      className="overflow-hidden bg-[#071a31] py-[90px] text-white max-[700px]:py-[58px] max-[420px]:py-[48px]"
    >
      <div className="mx-auto w-[min(1180px,92%)] max-[700px]:w-[calc(100%-32px)] max-[420px]:w-[calc(100%-24px)] text-center">
        <div className="text-[12px] font-bold tracking-[3px] text-[#f0cf78] max-[640px]:text-[10px] max-[640px]:tracking-[2px]">
          MEMBERSHIP PREVIEW
        </div>

        <h2 className="my-[10px] font-[Georgia,Times_New_Roman,serif] text-[48px] font-bold leading-[1.1] text-white max-[700px]:text-[34px] max-[700px]:leading-[1.15] max-[420px]:text-[30px]">
          Your Privilege, In Your Hand
        </h2>

        <p className="mx-auto mb-[48px] max-w-[650px] text-[16px] text-[#b8c7c3] max-[700px]:mb-[32px] max-[700px]:text-[14px]">
          An exclusive Lorvens Club membership card designed in a rich gold finish, representing access to a world of premium experiences and privileges.
        </p>

        <div className="mx-auto grid max-w-[850px] grid-cols-2 items-center gap-[52px] max-[900px]:max-w-[560px] max-[900px]:grid-cols-1 max-[900px]:gap-[34px] max-[700px]:gap-[28px]">
          <div>
            <div className="rounded-[16px] bg-[linear-gradient(135deg,#c9982b,#f6d57e,#9a6b15)] p-[12px] shadow-[0_25px_55px_rgba(0,0,0,0.38)] max-[700px]:rounded-[12px] max-[700px]:p-[8px]">
              <img
                src="/assets/membership-card-front.png"
                alt="Lorvens Club membership card front"
                className="block w-full rounded-[10px] bg-[#d49e23]"
              />
            </div>
            <div className="mt-[18px] text-center text-[13px] tracking-[2px] text-[#f0cf78] max-[700px]:mt-[12px] max-[700px]:text-[11px] max-[700px]:tracking-[1.4px]">
              MEMBERSHIP CARD • BACK
            </div>
          </div>

          <div>
            <div className="rounded-[16px] bg-[linear-gradient(135deg,#c9982b,#f6d57e,#9a6b15)] p-[12px] shadow-[0_25px_55px_rgba(0,0,0,0.38)] max-[700px]:rounded-[12px] max-[700px]:p-[8px]">
              <img
                src="/assets/membership-card-back.png"
                alt="Lorvens Club membership card back"
                className="block w-full rounded-[10px] bg-[#d49e23]"
              />
            </div>
            <div className="mt-[18px] text-center text-[13px] tracking-[2px] text-[#f0cf78] max-[700px]:mt-[12px] max-[700px]:text-[11px] max-[700px]:tracking-[1.4px]">
              MEMBERSHIP CARD • FRONT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Membership;

function About() {
  return (
    <section
      id="about"
      className="bg-[linear-gradient(180deg,#fffdf8,#f4efe4)] py-[88px] max-[700px]:py-[58px] max-[420px]:py-[48px]"
    >
      <div className="mx-auto grid w-[min(1180px,92%)] max-[700px]:w-[calc(100%-32px)] max-[420px]:w-[calc(100%-24px)] grid-cols-2 items-center gap-[70px] max-[900px]:grid-cols-1 max-[900px]:gap-[34px]">
        <div>
          <div className="text-[12px] font-bold tracking-[3px] text-[#c99a2e] max-[640px]:text-[10px] max-[640px]:tracking-[2px]">
            LORVENS CLUB • TIRUPATI
          </div>

          <h2 className="my-[12px] mb-[20px] font-[Georgia,Times_New_Roman,serif] text-[50px] font-bold leading-[1.1] text-[#113b34] max-[700px]:text-[34px] max-[700px]:leading-[1.15] max-[420px]:text-[30px]">
            More Than a Club.
            <br />
            A Better Lifestyle.
          </h2>

          <p className="text-[17px] text-[#6f776f] max-[700px]:text-[15px]">
            Lorvens Club is envisioned as a premium lifestyle destination inspired by comfort, wellness, nature and meaningful connections. From recreation and dining to wellness and exclusive member experiences, every space is designed to feel special.
          </p>
        </div>

        <div className="border-l-[4px] border-[#c99a2e] bg-[#113b34] px-[38px] py-[34px] text-white shadow-[0_18px_45px_rgba(8,46,40,0.15)] max-[700px]:px-[24px] max-[700px]:py-[26px]">
          <h3 className="mb-[14px] font-[Georgia,Times_New_Roman,serif] text-[25px] font-bold leading-[1.1] tracking-[1px] text-[#f0cf78] max-[700px]:text-[22px]">
            VISIT OUR CLUB
          </h3>

          <p className="m-0 whitespace-pre-line text-[17px] leading-[1.55] text-[#e3ece7] max-[700px]:text-[15px]">
            LORNVENS CLUB
            <br />
            S.No: 383, Vemuru,
            <br />
            Tirupati -517503,
            <br />
            Andhra Pradesh.
            <br />
            <br />
            www.lorvensclub.com
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;

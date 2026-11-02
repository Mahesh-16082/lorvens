
import { useRef, useState, type FormEvent, type ReactNode } from "react";

type FamilyMember = {
  id: number;
  fullName: string;
  relationship: string;
  dob: string;
  pan: string;
  aadhaar: string;
};

type BookingFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

const emptyFamilyMember = (id: number): FamilyMember => ({
  id,
  fullName: "",
  relationship: "",
  dob: "",
  pan: "",
  aadhaar: "",
});

const benefits = [
  ["Exclusive Privileges", "Priority access across Lorvens Club facilities and partner venues."],
  ["Preferred Bookings", "Advance reservation opportunities for club events, stays and services."],
  ["Member Discounts", "Special member rates on dining, stays and recreational activities."],
  ["Dedicated Support", "Personalized assistance for membership-related queries."],
  ["Referral Rewards", "Exclusive rewards and club vouchers for successful referrals."],
];

const terms = [
  ["Validity & AMC", "Membership is for a lifetime. Annual Maintenance Charges (AMC) begin from the 6th year onwards from the date of issuance."],
  ["Non-Transferability", "Membership is non-transferable and is intended for the registered primary member and authorized family members."],
  ["Property Ownership", "Physical membership cards remain the property of Lorvens Club and must be returned upon request."],
  ["Loss or Damage", "Lost or misplaced cards must be reported to club management immediately."],
  ["Fee Non-Refundability", "Membership fees are non-refundable upon issuance of the membership card."],
];

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#ded8cb] bg-white px-3 py-2.5 text-sm text-[#1d302c] outline-none transition placeholder:text-[#a5a095] focus:border-[#bd9134] focus:ring-2 focus:ring-[#bd9134]/10";

const labelClass = "block text-sm font-semibold text-[#34443e]";

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  pattern,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  maxLength?: number;
}) {
  return (
    <label className={labelClass}>
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
      <input
        className={inputClass}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        maxLength={maxLength}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className={labelClass}>
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
      <select
        className={inputClass}
        name={name}
        required={required}
        defaultValue=""
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function UploadField({
  label,
  name,
  accept = ".pdf,.jpg,.jpeg,.png",
  required = false,
}: {
  label: string;
  name: string;
  accept?: string;
  required?: boolean;
}) {
  return (
    <label className={labelClass}>
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
      <input
        className={`${inputClass} cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-[#102f29] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white`}
        type="file"
        name={name}
        accept={accept}
        required={required}
      />
    </label>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e9e3d8] bg-white p-4 shadow-[0_5px_22px_rgba(30,40,30,0.035)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f5edda] text-sm font-extrabold text-[#9a7427]">
          {number}
        </span>

        <div>
          <h3 className="m-0 font-[Georgia,serif] text-lg font-bold text-[#102f29] sm:text-xl">
            {title}
          </h3>

          {description && (
            <p className="mb-0 mt-1 text-xs leading-5 text-[#7a817a]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

export default function BookingForm({
  isOpen,
  onClose,
}: BookingFormProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [nextId, setNextId] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const stepContentRef = useRef<HTMLDivElement>(null);

  const stepTitles = [
    "Primary Member Details",
    "Membership Details",
    "Family Member Details",
    "Document Upload",
    "Payment Details",
    "Membership Benefits",
    "Terms & Declaration",
  ];

  const goToNextStep = () => {
    const fields =
      stepContentRef.current?.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea");

    if (fields) {
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          field.focus();
          return;
        }
      }
    }

    setCurrentStep((step) =>
      Math.min(step + 1, stepTitles.length - 1)
    );

    setSubmitted(false);
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setSubmitted(false);
  };

  const addFamilyMember = () => {
    if (familyMembers.length >= 5) return;

    setFamilyMembers((current) => [
      ...current,
      emptyFamilyMember(nextId),
    ]);

    setNextId((id) => id + 1);
  };

  const updateFamilyMember = (
    id: number,
    field: keyof FamilyMember,
    value: string
  ) => {
    setFamilyMembers((current) =>
      current.map((member) =>
        member.id === id
          ? { ...member, [field]: value }
          : member
      )
    );
  };

  const removeFamilyMember = (id: number) => {
    setFamilyMembers((current) =>
      current.filter((member) => member.id !== id)
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#061b18]/40 p-3 backdrop-blur-[1px] sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* COMPACT CENTERED POPUP */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-form-title"
        className="my-auto flex max-h-[90vh] w-full max-w-[850px] flex-col overflow-y-auto overscroll-contain rounded-2xl bg-[#f8f6f0] shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:rounded-3xl"
      >
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-[#d6b66c]/30 bg-[#071a31] px-5 py-3 text-white sm:px-6">
          <div>
            <p className="mb-1 text-[9px] font-bold tracking-[3px] text-[#e4bd68]">
              LORVENS CLUB · TIRUPATI
            </p>

            <h2
              id="membership-form-title"
              className="m-0 font-[Georgia,serif] text-lg font-bold sm:text-xl"
            >
              Membership Application
            </h2>

            <p className="mb-0 mt-1 text-xs text-white/65">
              Begin your journey with an exclusive club experience.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close application"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/25 text-xl text-white transition hover:bg-white/10"
          >
            ×
          </button>
        </header>

        {/* MAIN CONTENT */}
        <div className="px-4 py-5 sm:px-6 sm:py-5">

          {/* INTRO */}
          <div className="mb-5 rounded-xl bg-[linear-gradient(120deg,#102f29,#17483d)] p-4 text-white sm:p-5">
            <p className="mb-2 text-[9px] font-bold tracking-[3px] text-[#e4bd68]">
              EXCLUSIVE MEMBERSHIP
            </p>

            <h1 className="mb-2 font-[Georgia,serif] text-xl font-bold sm:text-2xl">
              Your place in the Lorvens circle.
            </h1>

            <p className="mb-0 max-w-2xl text-xs leading-5 text-white/75 sm:text-sm">
              Complete the application below. Keep your identity documents
              and photographs ready before you begin.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-white/20 px-3 py-1">
                Lifetime membership
              </span>

              <span className="rounded-full border border-white/20 px-3 py-1">
                Up to 5 family members
              </span>

              <span className="rounded-full border border-white/20 px-3 py-1">
                Secure document handling required
              </span>
            </div>
          </div>

          {/* SUBMISSION MESSAGE */}
          {submitted && (
            <div
              className="mb-4 rounded-xl border border-[#c99a2e] bg-[#fff7e4] p-3 text-sm leading-6 text-[#55451f]"
              role="status"
            >
              <strong>
                Form completed and validated in your browser.
              </strong>{" "}
              Your application has not been sent or saved because a secure
              backend submission endpoint has not yet been connected.
            </div>
          )}

          {/* PROGRESS BAR */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="m-0 text-sm font-bold text-[#173e34]">
                Step {currentStep + 1} of {stepTitles.length}
              </p>

              <p className="m-0 text-xs font-semibold text-[#8b8069]">
                {Math.round(
                  ((currentStep + 1) / stepTitles.length) * 100
                )}
                % complete
              </p>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e2d6]">
              <div
                className="h-full rounded-full bg-[#c99a2e] transition-all duration-300"
                style={{
                  width: `${
                    ((currentStep + 1) / stepTitles.length) * 100
                  }%`,
                }}
              />
            </div>

            <div className="mt-3 hidden flex-wrap gap-1.5 lg:flex">
              {stepTitles.map((title, index) => (
                <span
                  key={title}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    index === currentStep
                      ? "bg-[#173e34] text-white"
                      : index < currentStep
                        ? "bg-[#e8dfc9] text-[#71551d]"
                        : "bg-[#efede7] text-[#88877f]"
                  }`}
                >
                  {index + 1}. {title}
                </span>
              ))}
            </div>

            <p className="mb-0 mt-2 text-xs font-bold text-[#173e34] lg:hidden">
              {stepTitles[currentStep]}
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            onChange={() => setSubmitted(false)}
            className="space-y-4"
          >
            <div ref={stepContentRef} className="space-y-4">

              {/* STEP 1: PRIMARY MEMBER DETAILS */}
              {currentStep === 0 && (
                <Section
                  number="01"
                  title="Primary Member Details"
                  description="Tell us about the primary applicant."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field
                        label="Full name"
                        name="primaryFullName"
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <Field
                      label="Date of birth"
                      name="primaryDob"
                      type="date"
                      required
                    />

                    <SelectField
                      label="Gender"
                      name="gender"
                      options={["Male", "Female", "Other"]}
                      required
                    />

                    <Field
                      label="Mobile number"
                      name="mobile"
                      type="tel"
                      required
                      pattern="[0-9+() -]{8,18}"
                      placeholder="Enter contact number"
                    />

                    <Field
                      label="Email address"
                      name="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                    />

                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Residential address
                        <span className="ml-1 text-red-600">*</span>

                        <textarea
                          className={inputClass}
                          name="address"
                          rows={2}
                          required
                          placeholder="House / street, city, state and PIN code"
                        />
                      </label>
                    </div>

                    <Field
                      label="PAN number"
                      name="primaryPan"
                      required
                      placeholder="ABCDE1234F"
                      pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]"
                      maxLength={10}
                    />

                    <Field
                      label="Aadhaar number"
                      name="primaryAadhaar"
                      required
                      placeholder="12-digit Aadhaar number"
                      pattern="[0-9 ]{12,14}"
                      maxLength={14}
                    />

                    <div className="sm:col-span-2">
                      <UploadField
                        label="Primary member photograph"
                        name="primaryPhoto"
                        accept="image/*"
                        required
                      />
                    </div>
                  </div>
                </Section>
              )}

              {/* STEP 2: MEMBERSHIP DETAILS */}
              {currentStep === 1 && (
                <Section
                  number="02"
                  title="Membership Details"
                  description="Choose how your membership card should be issued."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Name to print on membership card"
                      name="nameOnCard"
                      required
                      placeholder="Name as it should appear on the card"
                    />

                    <label className={labelClass}>
                      Membership validity

                      <input
                        className={`${inputClass} bg-[#f3f0e8] font-semibold`}
                        value="Lifetime · AMC from 6th year"
                        readOnly
                      />
                    </label>
                  </div>
                </Section>
              )}

              {/* STEP 3: FAMILY MEMBER DETAILS */}
              {currentStep === 2 && (
                <Section
                  number="03"
                  title="Family Member Details"
                  description="Add up to five family members. This section is optional."
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="m-0 text-sm text-[#788078]">
                      {familyMembers.length} of 5 family members added
                    </p>

                    <button
                      type="button"
                      onClick={addFamilyMember}
                      disabled={familyMembers.length >= 5}
                      className="cursor-pointer rounded-lg border border-[#173e34] px-4 py-2 text-xs font-bold text-[#173e34] transition hover:bg-[#173e34] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      + Add family member
                    </button>
                  </div>

                  {familyMembers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#d8d1c3] bg-[#fbfaf7] p-5 text-center text-sm text-[#85877f]">
                      No family members added. Select "Add family member"
                      if you want to include someone.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {familyMembers.map((member, index) => (
                        <div
                          key={member.id}
                          className="rounded-xl border border-[#e7e1d6] bg-[#fbfaf7] p-3 sm:p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="m-0 text-sm font-bold text-[#173e34]">
                              Family member {index + 1}
                            </h4>

                            <button
                              type="button"
                              onClick={() => removeFamilyMember(member.id)}
                              className="cursor-pointer text-xs font-semibold text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {(
                              [
                                ["fullName", "Full name", "text"],
                                ["relationship", "Relationship", "text"],
                                ["dob", "Date of birth", "date"],
                                ["pan", "PAN number", "text"],
                                ["aadhaar", "Aadhaar number", "text"],
                              ] as const
                            ).map(([field, label, type]) => (
                              <label key={field} className={labelClass}>
                                {label}

                                <input
                                  className={inputClass}
                                  type={type}
                                  value={member[field]}
                                  onChange={(event) =>
                                    updateFamilyMember(
                                      member.id,
                                      field,
                                      event.target.value
                                    )
                                  }
                                  placeholder={
                                    field === "relationship"
                                      ? "e.g. Spouse, Child, Parent"
                                      : ""
                                  }
                                  maxLength={
                                    field === "pan"
                                      ? 10
                                      : field === "aadhaar"
                                        ? 14
                                        : undefined
                                  }
                                />
                              </label>
                            ))}
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <UploadField
                              label="Member photograph"
                              name={`familyPhoto${member.id}`}
                              accept="image/*"
                            />

                            <UploadField
                              label="Aadhaar copy"
                              name={`familyAadhaar${member.id}`}
                            />

                            <UploadField
                              label="PAN copy"
                              name={`familyPan${member.id}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* STEP 4: DOCUMENT UPLOAD */}
              {currentStep === 3 && (
                <Section
                  number="04"
                  title="Document Upload"
                  description="Upload clear copies of the required documents."
                >
                  <div className="mb-3 rounded-xl bg-[#f6f1e6] p-3 text-xs leading-5 text-[#6d624d]">
                    Please prepare self-attested Aadhaar and PAN copies
                    for the primary member and each registered family
                    member, along with passport-size photographs.
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <UploadField
                      label="Primary member Aadhaar copy"
                      name="primaryAadhaarCopy"
                      required
                    />

                    <UploadField
                      label="Primary member PAN copy"
                      name="primaryPanCopy"
                      required
                    />
                  </div>

                  <p className="mb-0 mt-3 text-xs leading-5 text-[#8b887f]">
                    Accepted uploads: PDF, JPG or PNG. Family member
                    document uploads are available in each family
                    member's card above.
                  </p>
                </Section>
              )}

              {/* STEP 5: PAYMENT DETAILS */}
              {currentStep === 4 && (
                <Section
                  number="05"
                  title="Payment Details"
                  description="Provide payment details for membership processing."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Membership fee"
                      name="membershipFee"
                      required
                      placeholder="Enter amount"
                    />

                    <SelectField
                      label="Payment method"
                      name="paymentMode"
                      options={["Cash", "Card", "UPI", "Cheque / DD", "NEFT"]}
                      required
                    />

                    <Field
                      label="Transaction / cheque number"
                      name="transactionNumber"
                      placeholder="Enter reference number"
                    />

                    <Field
                      label="Bank and branch"
                      name="bankBranch"
                      placeholder="Enter bank and branch name"
                    />
                  </div>
                </Section>
              )}

              {/* STEP 6: MEMBERSHIP BENEFITS */}
              {currentStep === 5 && (
                <Section
                  number="06"
                  title="Membership Benefits"
                  description="A summary of the privileges associated with Lorvens Club membership."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {benefits.map(([title, description]) => (
                      <div
                        key={title}
                        className="rounded-xl bg-[#f8f6f0] p-3"
                      >
                        <h4 className="mb-1 mt-0 text-sm font-bold text-[#173e34]">
                          {title}
                        </h4>

                        <p className="m-0 text-xs leading-5 text-[#737970]">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <img
                        src="/assets/membership-card-front.png"
                        alt="Lorvens Club membership card front preview"
                        className="w-full rounded-xl border border-[#dfc27e] shadow-sm"
                      />

                      <p className="mb-0 mt-2 text-center text-[10px] font-bold tracking-[1.5px] text-[#94702b]">
                        CARD FRONT PREVIEW
                      </p>
                    </div>

                    <div>
                      <img
                        src="/assets/membership-card-back.png"
                        alt="Lorvens Club membership card back preview"
                        className="w-full rounded-xl border border-[#dfc27e] shadow-sm"
                      />

                      <p className="mb-0 mt-2 text-center text-[10px] font-bold tracking-[1.5px] text-[#94702b]">
                        CARD BACK PREVIEW
                      </p>
                    </div>
                  </div>
                </Section>
              )}

              {/* STEP 7: TERMS AND DECLARATION */}
              {currentStep === 6 && (
                <>
                  <Section
                    number="07"
                    title="Terms & Declaration"
                    description="Review the membership conditions before submitting your application."
                  >
                    <ol className="space-y-2 pl-5 text-xs leading-5 text-[#606b63]">
                      {terms.map(([title, description]) => (
                        <li key={title}>
                          <strong className="text-[#263d34]">
                            {title}:
                          </strong>{" "}
                          {description}
                        </li>
                      ))}
                    </ol>

                    <div className="mt-4 rounded-xl border border-[#e6ddc9] bg-[#f8f4e9] p-3 text-xs leading-5 text-[#5f5a4e]">
                      <strong className="text-[#283d34]">
                        Applicant declaration
                      </strong>

                      <p className="mb-0 mt-1">
                        I confirm that the information provided for myself
                        and my family members is true and accurate. I agree
                        to the membership privileges, terms, conditions and
                        applicable AMC schedule of Lorvens Club.
                      </p>
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#34443e]">
                      <input
                        type="checkbox"
                        name="declarationAccepted"
                        required
                        className="mt-1 h-4 w-4 accent-[#173e34]"
                      />

                      <span>
                        I have read and accept the declaration and
                        membership terms above.
                        <span className="ml-1 text-red-600">*</span>
                      </span>
                    </label>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Application date"
                        name="applicationDate"
                        type="date"
                        required
                      />

                      <Field
                        label="Applicant signature (type full name)"
                        name="applicantSignature"
                        required
                        placeholder="Type your full name"
                      />
                    </div>
                  </Section>

                  <div className="rounded-xl border border-[#e5dfd3] bg-[#f1eee7] p-4">
                    <p className="mb-1 text-xs font-extrabold tracking-[1.5px] text-[#6d624d]">
                      FOR CLUB ADMINISTRATION
                    </p>

                    <p className="m-0 text-xs leading-5 text-[#7b7b72]">
                      Membership ID, receipt number, document verification,
                      cards issued, processing officer and authorized
                      signature are reserved for Lorvens Club staff.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* BACK AND NEXT BUTTONS */}
            <div className="flex flex-col-reverse gap-3 border-t border-[#e5dfd3] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={
                  currentStep === 0
                    ? onClose
                    : goToPreviousStep
                }
                className="cursor-pointer rounded-lg border border-[#173e34] px-6 py-2.5 text-sm font-bold text-[#173e34] transition hover:bg-[#edf1ed]"
              >
                {currentStep === 0 ? "Cancel" : "Back"}
              </button>

              {currentStep < stepTitles.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="cursor-pointer rounded-lg bg-[#c99a2e] px-7 py-2.5 text-sm font-extrabold tracking-wide text-[#071a31] shadow-sm transition hover:bg-[#e1b64f]"
                >
                  Save & Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-[#c99a2e] px-6 py-2.5 text-sm font-extrabold tracking-wide text-[#071a31] shadow-sm transition hover:bg-[#e1b64f]"
                >
                  Submit membership application
                </button>
              )}
            </div>

            <p className="m-0 text-center text-[11px] leading-5 text-[#89877e]">
              Your details and documents contain sensitive personal
              information. Do not submit real identity documents until
              the club's secure backend and privacy controls are in place.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

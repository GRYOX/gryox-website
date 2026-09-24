"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useTranslations } from "next-intl";
import { sendContact } from "@/lib/contact/action";
import { CONTACT_TYPES, type ContactState } from "@/lib/contact/types";
import { applyPreset, morphTo, pulseEnergy } from "@/lib/three/presets";
import type { ContactType, MatterTarget } from "@/types/content";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";

/** Choosing a project type shapes the matter into that capability — the form answers back. */
const TYPE_TARGET: Record<ContactType, MatterTarget> = {
  website: "environment",
  software: "interface",
  app: "device",
  ai: "network",
  automation: "systems",
  unsure: "chaos",
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function Contact() {
  const t = useTranslations("contact");
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { status: "idle" });
  const [type, setType] = useState<ContactType | null>(null);
  const [formKey, setFormKey] = useState(0);
  const uid = useId();

  useEffect(() => {
    if (state.status === "success") {
      pulseEnergy(1.4);
      morphTo("mark", 1.6);
    }
  }, [state]);

  const choose = (value: ContactType) => {
    setType(value);
    morphTo(TYPE_TARGET[value], 1.5);
  };

  const reset = () => {
    setType(null);
    setFormKey((k) => k + 1);
    applyPreset("contact", true);
  };

  const err = state.status === "error" ? state.errors : undefined;
  const fieldClass =
    "peer w-full border-b border-line-strong bg-transparent pt-7 pb-3 text-lg text-fg outline-none transition-colors placeholder:text-transparent focus:border-green aria-[invalid=true]:border-purple-ink";
  const labelClass =
    "pointer-events-none absolute top-7 left-0 text-lg text-muted transition-all duration-300 ease-out-expo peer-focus:top-0 peer-focus:text-xs peer-focus:tracking-[0.14em] peer-focus:uppercase peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:tracking-[0.14em] peer-[:not(:placeholder-shown)]:uppercase";

  return (
    <section id="contact" className="relative gutter py-[18vh]" aria-labelledby="contact-title">
      <SceneTrigger preset="contact" />

      <div className="relative grid gap-10 lg:grid-cols-12">
        <SectionLabel index="07" className="lg:col-span-12">
          {t("label")}
        </SectionLabel>
        <RevealText
          as="h2"
          id="contact-title"
          by="words"
          className="display-wide text-[clamp(2.3rem,6.6vw,7.4rem)] text-fg uppercase lg:col-span-11"
        >
          {t("title")}
        </RevealText>
        <p className="max-w-[40ch] text-lg leading-relaxed text-muted lg:col-span-5">{t("intro")}</p>
      </div>

      <div className="relative mt-[8vh] lg:grid lg:grid-cols-12">
        <AnimatePresence mode="wait" initial={false}>
          {state.status === "success" ? (
            <m.div
              key="done"
              role="status"
              className="flex min-h-[420px] flex-col justify-center gap-6 lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p className="display-wide text-[clamp(3rem,9vw,7rem)] text-idea">{t("successTitle")}</p>
              <p className="max-w-[40ch] text-lg text-muted">{t("successBody")}</p>
              <button
                type="button"
                onClick={reset}
                className="w-fit border-b border-line-strong pb-1 text-sm text-fg hover-fine:hover:border-green"
              >
                {t("again")}
              </button>
            </m.div>
          ) : (
            <m.form
              key={`form-${formKey}`}
              action={action}
              noValidate
              className="lg:col-span-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <fieldset aria-describedby={err?.type ? `${uid}-type-err` : undefined}>
                <legend className="mb-6 flex items-center gap-3 hud text-muted">
                  <span className="text-green-ink">01</span>
                  <span aria-hidden="true" className="h-3 w-px rotate-[20deg] bg-line-strong" />
                  {t("stepType")}
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CONTACT_TYPES.map((value) => {
                    const checked = type === value;
                    return (
                      <label
                        key={value}
                        data-cursor="select"
                        className={`chamfer-frame relative flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-sm [--c:8px] [--fill:var(--bg)] has-[:focus-visible]:underline has-[:focus-visible]:[--frame:var(--green)] ${
                          checked
                            ? "text-fg [--fill:color-mix(in_oklab,var(--green)_12%,var(--bg))] [--frame:var(--green)]"
                            : "text-muted [--frame:var(--line-strong)] hover-fine:hover:text-fg hover-fine:hover:[--frame:var(--fg-faint)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={value}
                          checked={checked}
                          onChange={() => choose(value)}
                          className="sr-only"
                        />
                        {t(`types.${value}`)}
                        <span
                          aria-hidden="true"
                          className={`size-2 rotate-45 border transition-colors ${checked ? "border-green bg-green" : "border-line-strong"}`}
                        />
                      </label>
                    );
                  })}
                </div>
                {err?.type && (
                  <p id={`${uid}-type-err`} className="mt-3 text-sm text-purple-ink">
                    {t("errors.type")}
                  </p>
                )}
              </fieldset>

              <fieldset className="mt-14">
                <legend className="mb-2 flex items-center gap-3 hud text-muted">
                  <span className="text-green-ink">02</span>
                  <span aria-hidden="true" className="h-3 w-px rotate-[20deg] bg-line-strong" />
                  {t("stepDetails")}
                </legend>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  <Field
                    id={`${uid}-name`}
                    name="name"
                    defaultValue={state.values?.name}
                    label={t("fields.name")}
                    error={err?.name ? t("errors.name") : undefined}
                    autoComplete="name"
                    required
                    className={fieldClass}
                    labelClass={labelClass}
                  />
                  <Field
                    id={`${uid}-company`}
                    name="company"
                    defaultValue={state.values?.company}
                    label={`${t("fields.company")} · ${t("fields.companyHint")}`}
                    autoComplete="organization"
                    className={fieldClass}
                    labelClass={labelClass}
                  />
                  <Field
                    id={`${uid}-contact`}
                    name="contact"
                    defaultValue={state.values?.contact}
                    label={t("fields.contact")}
                    error={err?.contact ? t("errors.contact") : undefined}
                    autoComplete="email"
                    required
                    className={fieldClass}
                    labelClass={labelClass}
                    wide
                  />
                  <div className="relative sm:col-span-2">
                    <textarea
                      id={`${uid}-message`}
                      name="message"
                      defaultValue={state.values?.message}
                      rows={4}
                      required
                      placeholder={t("fields.messagePlaceholder")}
                      aria-invalid={err?.message ? true : undefined}
                      aria-describedby={err?.message ? `${uid}-message-err` : undefined}
                      className={`${fieldClass} resize-none focus:placeholder:text-faint`}
                      data-lenis-prevent
                    />
                    <label htmlFor={`${uid}-message`} className={labelClass}>
                      {t("fields.message")}
                    </label>
                    {err?.message && (
                      <p id={`${uid}-message-err`} className="mt-2 text-sm text-purple-ink">
                        {t("errors.message")}
                      </p>
                    )}
                  </div>
                </div>
                {/* Honeypot */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                  </label>
                </div>
              </fieldset>

              <div aria-live="polite" className="mt-6 min-h-6 text-sm text-purple-ink">
                {state.status === "unconfigured" && t("errors.unconfigured")}
                {state.status === "error" && !err && t("errors.failed")}
              </div>

              <button
                type="submit"
                disabled={pending}
                data-cursor="send"
                className="group relative mt-4 flex w-full items-center justify-between overflow-hidden bg-fg px-6 py-6 text-bg chamfer disabled:opacity-60 sm:px-8 sm:py-7"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-green to-purple transition-transform duration-700 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
                <span className="relative display-wide text-[clamp(1.4rem,3.4vw,2.6rem)] uppercase">
                  {pending ? t("sending") : t("submit")}
                </span>
                <span
                  aria-hidden="true"
                  className="relative text-2xl transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
                >
                  →
                </span>
              </button>
            </m.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Field({
  id,
  name,
  defaultValue,
  label,
  error,
  autoComplete,
  required,
  className,
  labelClass,
  wide,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  label: string;
  error?: string;
  autoComplete?: string;
  required?: boolean;
  className: string;
  labelClass: string;
  wide?: boolean;
}) {
  return (
    <div className={`relative ${wide ? "sm:col-span-2" : ""}`}>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        type="text"
        placeholder={label}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={className}
      />
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm text-purple-ink">
          {error}
        </p>
      )}
    </div>
  );
}

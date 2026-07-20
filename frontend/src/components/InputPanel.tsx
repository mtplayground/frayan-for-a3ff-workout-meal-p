import { Activity, CheckCircle2, Leaf, Ruler, Scale, Target, WalletCards } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ActivityLevel, FitnessGoal, PlanRequest, TargetBodyArea } from "../api/types";

type PlanFormValues = {
  weight: string;
  height: string;
  target_body_area: TargetBodyArea | "";
  meal_prep_budget: string;
  fitness_goal: FitnessGoal | "";
  activity_level: ActivityLevel | "";
};

type FieldName = keyof PlanFormValues;

type FieldErrors = Partial<Record<FieldName, string>>;

type InputPanelProps = {
  onValidRequestChange?: (request: PlanRequest | null) => void;
};

const initialValues: PlanFormValues = {
  weight: "82",
  height: "178",
  target_body_area: "upper_body",
  meal_prep_budget: "125.00",
  fitness_goal: "muscle_gain",
  activity_level: "very_active",
};

const targetBodyAreaOptions: Array<{ label: string; value: TargetBodyArea }> = [
  { label: "Lower body", value: "lower_body" },
  { label: "Upper body", value: "upper_body" },
  { label: "Core", value: "core" },
  { label: "Full body", value: "full_body" },
  { label: "Mobility", value: "mobility" },
];

const fitnessGoalOptions: Array<{ label: string; value: FitnessGoal }> = [
  { label: "Fat loss", value: "fat_loss" },
  { label: "Muscle gain", value: "muscle_gain" },
  { label: "General fitness", value: "general_fitness" },
];

const activityLevelOptions: Array<{ label: string; value: ActivityLevel }> = [
  { label: "Sedentary", value: "sedentary" },
  { label: "Light", value: "light" },
  { label: "Moderate", value: "moderate" },
  { label: "Active", value: "active" },
  { label: "Very active", value: "very_active" },
];

const fieldIcons: Record<
  FieldName,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  weight: Scale,
  height: Ruler,
  target_body_area: Target,
  meal_prep_budget: WalletCards,
  fitness_goal: Activity,
  activity_level: Leaf,
};

export function InputPanel({ onValidRequestChange }: InputPanelProps) {
  const [values, setValues] = useState<PlanFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const validation = useMemo(() => validatePlanForm(values), [values]);

  useEffect(() => {
    onValidRequestChange?.(validation.request);
  }, [onValidRequestChange, validation.request]);

  function updateValue(field: FieldName, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function markTouched(field: FieldName) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setTouched({
      weight: true,
      height: true,
      target_body_area: true,
      meal_prep_budget: true,
      fitness_goal: true,
      activity_level: true,
    });
  }

  return (
    <section aria-labelledby="input-panel-title" className="dashboard-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-ocean-700">Inputs</p>
          <h3 id="input-panel-title" className="text-lg font-semibold text-ink-900">
            Profile and targets
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-50 text-ocean-700">
          <Target aria-hidden={true} className="h-5 w-5" />
        </div>
      </div>

      <form className="mt-5 grid gap-4" noValidate onSubmit={handleSubmit}>
        <NumberField
          field="weight"
          label="Weight"
          suffix="kg"
          min={30}
          max={300}
          step="0.1"
          value={values.weight}
          error={visibleError("weight", validation.errors, touched, submitAttempted)}
          onBlur={() => markTouched("weight")}
          onChange={updateValue}
        />
        <NumberField
          field="height"
          label="Height"
          suffix="cm"
          min={100}
          max={250}
          step="0.1"
          value={values.height}
          error={visibleError("height", validation.errors, touched, submitAttempted)}
          onBlur={() => markTouched("height")}
          onChange={updateValue}
        />
        <SelectField
          field="target_body_area"
          label="Target body area"
          value={values.target_body_area}
          options={targetBodyAreaOptions}
          error={visibleError("target_body_area", validation.errors, touched, submitAttempted)}
          onBlur={() => markTouched("target_body_area")}
          onChange={updateValue}
        />
        <NumberField
          field="meal_prep_budget"
          label="Meal prep budget"
          prefix="$"
          min={5}
          max={1000}
          step="0.01"
          value={values.meal_prep_budget}
          error={visibleError("meal_prep_budget", validation.errors, touched, submitAttempted)}
          onBlur={() => markTouched("meal_prep_budget")}
          onChange={updateValue}
        />
        <SelectField
          field="fitness_goal"
          label="Fitness goal"
          value={values.fitness_goal}
          options={fitnessGoalOptions}
          emptyLabel="Default"
          error={visibleError("fitness_goal", validation.errors, touched, submitAttempted)}
          onBlur={() => markTouched("fitness_goal")}
          onChange={updateValue}
        />
        <SelectField
          field="activity_level"
          label="Activity level"
          value={values.activity_level}
          options={activityLevelOptions}
          emptyLabel="Default"
          error={visibleError("activity_level", validation.errors, touched, submitAttempted)}
          onBlur={() => markTouched("activity_level")}
          onChange={updateValue}
        />

        <div className="flex items-center justify-between gap-3 border-t border-mist-200 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-leaf-700">
            <CheckCircle2 aria-hidden={true} className="h-4 w-4" />
            {validation.request ? "Inputs ready" : "Check inputs"}
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg bg-ocean-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-700 focus:ring-offset-2"
          >
            Update plan
          </button>
        </div>
      </form>
    </section>
  );
}

function NumberField({
  field,
  label,
  value,
  error,
  min,
  max,
  step,
  prefix,
  suffix,
  onBlur,
  onChange,
}: {
  field: FieldName;
  label: string;
  value: string;
  error?: string;
  min: number;
  max: number;
  step: string;
  prefix?: string;
  suffix?: string;
  onBlur: () => void;
  onChange: (field: FieldName, value: string) => void;
}) {
  return (
    <FieldShell field={field} label={label} error={error}>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-ink-500">
            {prefix}
          </span>
        ) : null}
        <input
          id={field}
          name={field}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${field}-error` : undefined}
          className={fieldControlClass(Boolean(error), Boolean(prefix), Boolean(suffix))}
          onBlur={onBlur}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(field, event.target.value)}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-ink-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}

function SelectField<TValue extends string>({
  field,
  label,
  value,
  options,
  emptyLabel,
  error,
  onBlur,
  onChange,
}: {
  field: FieldName;
  label: string;
  value: TValue | "";
  options: Array<{ label: string; value: TValue }>;
  emptyLabel?: string;
  error?: string;
  onBlur: () => void;
  onChange: (field: FieldName, value: string) => void;
}) {
  return (
    <FieldShell field={field} label={label} error={error}>
      <select
        id={field}
        name={field}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field}-error` : undefined}
        className={fieldControlClass(Boolean(error))}
        onBlur={onBlur}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(field, event.target.value)}
      >
        {emptyLabel ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function FieldShell({
  field,
  label,
  error,
  children,
}: {
  field: FieldName;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const Icon = fieldIcons[field];

  return (
    <div className="space-y-2">
      <label htmlFor={field} className="flex items-center gap-2 text-sm font-semibold text-ink-700">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mist-50 text-ocean-700">
          <Icon aria-hidden={true} className="h-4 w-4" />
        </span>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${field}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function fieldControlClass(hasError: boolean, hasPrefix = false, hasSuffix = false) {
  return [
    "h-11 w-full rounded-lg border bg-white text-sm font-medium text-ink-900 shadow-sm transition focus:outline-none focus:ring-2",
    hasPrefix ? "pl-8" : "pl-3",
    hasSuffix ? "pr-12" : "pr-3",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-mist-200 focus:border-ocean-600 focus:ring-ocean-50",
  ].join(" ");
}

function visibleError(
  field: FieldName,
  errors: FieldErrors,
  touched: Partial<Record<FieldName, boolean>>,
  submitAttempted: boolean,
) {
  if (!touched[field] && !submitAttempted) {
    return undefined;
  }

  return errors[field];
}

function validatePlanForm(values: PlanFormValues): {
  errors: FieldErrors;
  request: PlanRequest | null;
} {
  const errors: FieldErrors = {};
  const weight = parseRequiredNumber(values.weight, "Weight", 30, 300, errors, "weight");
  const height = parseRequiredNumber(values.height, "Height", 100, 250, errors, "height");
  const budget = parseRequiredNumber(
    values.meal_prep_budget,
    "Meal prep budget",
    5,
    1000,
    errors,
    "meal_prep_budget",
  );

  if (!values.target_body_area) {
    errors.target_body_area = "Target body area is required.";
  }

  if (Object.keys(errors).length > 0 || !weight || !height || !budget || !values.target_body_area) {
    return { errors, request: null };
  }

  return {
    errors,
    request: {
      weight,
      height,
      target_body_area: values.target_body_area,
      meal_prep_budget: budget.toFixed(2),
      ...(values.fitness_goal ? { fitness_goal: values.fitness_goal } : {}),
      ...(values.activity_level ? { activity_level: values.activity_level } : {}),
    },
  };
}

function parseRequiredNumber(
  value: string,
  label: string,
  min: number,
  max: number,
  errors: FieldErrors,
  field: FieldName,
) {
  if (!value.trim()) {
    errors[field] = `${label} is required.`;
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    errors[field] = `${label} must be a number.`;
    return null;
  }

  if (parsed < min) {
    errors[field] = `${label} must be at least ${min}.`;
    return null;
  }

  if (parsed > max) {
    errors[field] = `${label} must be at most ${max}.`;
    return null;
  }

  return parsed;
}

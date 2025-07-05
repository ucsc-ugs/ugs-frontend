import styles from "./ElegantForm.module.css";
import { useState } from "react";
import { Button } from "../components/ui/button";

export type FormField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  placeholder?: string;
};

type ElegantFormProps = {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  title?: string;
};

export default function ElegantForm({ fields, onSubmit, title = "Registration Form" }: ElegantFormProps) {
  const initialState = Object.fromEntries(fields.map(f => [f.name, ""]));
  const [form, setForm] = useState<Record<string, string>>(initialState);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    onSubmit(form);
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>{title}</h2>
        {fields.map(field => (
          <div className="flex flex-col gap-2" key={field.name}>
            <label htmlFor={field.name} className={styles.label}>{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required={field.required}
                className={styles.textarea}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                required={field.required}
                className={styles.input}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <Button
          type="submit"
          className="bg-[#1e293b] hover:bg-[#334155] text-white font-bold rounded-xl py-3 mt-2 font-lato text-lg shadow-lg"
        >
          Submit
        </Button>
        {submitted && (
          <div className={styles.success}>Thank you! Your form has been submitted.</div>
        )}
      </form>
    </div>
  );
}

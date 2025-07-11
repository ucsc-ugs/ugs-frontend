import styles from "./RegistrationForm.module.css";
import { useState } from "react";
import { Button } from "./ui/button";

export default function RegistrationForm({ onSubmit }: { onSubmit?: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({
    name: "",
    nic: "",
    contact: "",
    email: "",
    program: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    onSubmit?.(form);
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Register for GCAT</h2>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="Enter your full name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="nic" className={styles.label}>NIC</label>
          <input
            id="nic"
            name="nic"
            type="text"
            value={form.nic}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="Enter your NIC number"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact" className={styles.label}>Contact Number</label>
          <input
            id="contact"
            name="contact"
            type="tel"
            value={form.contact}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="Enter your contact number"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="Enter your email"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="program" className={styles.label}>Program</label>
          <select
            id="program"
            name="program"
            value={form.program}
            onChange={handleChange}
            required
            className={styles.input}
          >
            <option value="" disabled>Select a program</option>
            <option value="MSc in CS">MSc in CS</option>
            <option value="MSc in CyberSecurity">MSc in CyberSecurity</option>
            <option value="Master of Philosophy">Master of Philosophy</option>
          </select>
        </div>
        <Button type="submit" className={styles.button}>Register</Button>
        {submitted && <div className={styles.success}>Registration submitted!</div>}
      </form>
    </div>
  );
}

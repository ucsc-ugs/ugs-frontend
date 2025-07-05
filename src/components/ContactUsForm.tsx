import styles from "./ContactUsForm.module.css";
import { useState } from "react";
import { Button } from "../components/ui/button";

export default function ContactUsForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    // handle contact us submission
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Contact Us</h2>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="Enter your name"
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
          <label htmlFor="message" className={styles.label}>Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            className={styles.textarea}
            placeholder="Type your message..."
          />
        </div>
        <Button type="submit" className={styles.button}>Send</Button>
        {submitted && <div className={styles.success}>Thank you! We'll get back to you soon.</div>}
      </form>
    </div>
  );
}

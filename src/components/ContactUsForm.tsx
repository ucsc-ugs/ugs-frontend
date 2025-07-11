import styles from "./ContactUsForm.module.css";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

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

  function handleBackToHome() {
    // logic to navigate back to home
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        {/* Header */}
        <div className="w-full text-center mb-8 flex flex-col items-center">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="mb-6 text-gray-600 hover:text-gray-800 self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="../src/assets/ucsc_logo.png"
              alt="UCSC Logo"
              width={50}
              height={35}
              className="object-contain"
            />
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">University Gateway Solutions</h1>
            </div>
          </div>
        </div>
        {/* Contact Form Card */}
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
      </div>
    </div>
  );
}

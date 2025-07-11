import React from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import styles from "./ExamResult.module.css";

interface ExamDetails {
  name: string;
  date: string;
  venue: string;
  fee: string;
  deadline: string;
  imageUrl?: string;
}

const ExamDetailsBox: React.FC<{ exam: ExamDetails }> = ({ exam }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img
            src={exam.imageUrl || "/ucsclogo.png"}
            alt="Exam Logo"
            className={styles.logo}
          />
          <div className={styles.examInfo}>
            <span className={styles.examTitle}>{exam.name}</span>
            <span className={styles.organization}>UCSC</span>
          </div>
        </div>
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Date:</div>
            <div className={styles.detailValue}>{exam.date}</div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Venue:</div>
            <div className={styles.detailValue}>{exam.venue}</div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Fee:</div>
            <div className={styles.detailValue}>{exam.fee}</div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Deadline:</div>
            <div className={styles.detailValue}>{exam.deadline}</div>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => navigate("/register")}>
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsBox;

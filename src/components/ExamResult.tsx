import styles from "./ExamResult.module.css";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

// Helper to get color based on grade/marks
function getResultColor(grade: string | number) {
  // You can adjust this logic for your grading system
  if (typeof grade === "number") {
    if (grade >= 90) return "#16a34a"; // green
    if (grade >= 75) return "#60a5fa"; // blue
    if (grade >= 50) return "#facc15"; // yellow
    return "#ef4444"; // red
  }
  // fallback for letter grades
  if (["A+", "A", "A-"].includes(grade)) return "#16a34a";
  if (["B+", "B", "B-"].includes(grade)) return "#60a5fa";
  if (["C+", "C", "C-"].includes(grade)) return "#facc15";
  return "#ef4444";
}

export default function ExamResult({
  examTitle = "GCCT Final Exam 2025",
  organization = "UCSC",
  logoUrl = "/ucsclogo.png",
  result = "Pass",
  grade = "A+",
  rank = "2",
  marks = 95
}: {
  examTitle?: string;
  organization?: string;
  logoUrl?: string;
  result?: string;
  grade?: string;
  rank?: string;
  marks?: number;
}) {
  const color = getResultColor(marks);
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <img
            src={logoUrl}
            alt="UCSC Logo"
            className={styles.logo}
          />
          <div className={styles.examInfo}>
            <span className={styles.examTitle}>{examTitle}</span>
            <span className={styles.organization}>{organization}</span>
          </div>
        </div>
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Result:</div>
            <div className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {result}
              <span style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: color,
                border: '2px solid #e2e8f0',
                marginLeft: 8
              }} title={`Marks: ${marks}`}></span>
            </div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Grade:</div>
            <div className={styles.detailValue}>{grade}</div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Rank:</div>
            <div className={styles.detailValue}>{rank}</div>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="outline">Detailed Report</Button>
          <Button variant="outline">Request Transcript</Button>
          {/* <Button variant="outline" onClick={() => navigate("/exam-details")}>View Exam Details</Button> */}
        </div>
      </Card>
    </div>
  );
}

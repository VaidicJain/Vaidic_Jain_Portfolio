export default function Ticker() {
  const skills = [
    "React",
    "Next.js",
    "TypeScript",
    "Redux Toolkit",
    "Tailwind CSS",
    "Node.js",
    "FastAPI",
    "MongoDB",
    "PostgreSQL",
    "Playwright",
  ];

  return (
    <div className="tk" aria-hidden="true">
      <div className="mono">
        {[...skills, ...skills, ...skills, ...skills].map((skill, idx) => (
          <span key={idx}>
            {skill}
            <i>/</i>
          </span>
        ))}
      </div>
    </div>
  );
}

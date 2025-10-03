import { TerminalCanvas } from "./components/TerminalCanvas";

export default function Home() {
  return (
    <main
      style={{
        margin: 0,
        padding: 0,
        overflow: "hidden",
        height: "100dvh",
        width: "100vw",
        backgroundColor: "#090812",
      }}
    >
      <TerminalCanvas />
    </main>
  );
}

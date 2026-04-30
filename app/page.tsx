export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0 }}>NCEU Hello World!</h1>
      <p style={{ fontSize: "1.5rem", marginTop: "1rem", opacity: 0.9 }}>
        Powered by vinext on Cloudflare Workers
      </p>
    </main>
  );
}

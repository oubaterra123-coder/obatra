export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 border-b">
      <h1 className="text-2xl font-bold">Obatra</h1>

      <div className="flex gap-6">
        <a href="/">Home</a>
        <a href="#">Features</a>
        <a href="#">Pricing</a>
      </div>
    </nav>
  );
}
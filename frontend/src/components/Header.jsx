function Header() {
  return (
    <header className="header">
      <div className="header__logo">
        <span className="header__icon">🐇</span>
        <span className="header__brand">Rabbitt AI</span>
      </div>
      <h1 className="header__title">
        Sales <span>Insight</span> Automator
      </h1>
      <p className="header__subtitle">
        Upload your sales data and get an AI-powered executive summary delivered straight to your inbox.
      </p>
    </header>
  );
}

export default Header;

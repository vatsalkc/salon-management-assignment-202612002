import { BrowserRouter, Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <span className="text-3xl">💈</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Elite Cuts Salon
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Smart queue management for modern salons
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
            ✓ Scaffolding Complete
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

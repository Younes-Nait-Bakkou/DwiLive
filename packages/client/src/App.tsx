import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-4">
      <Button>Primary Button</Button>
      <Button variant="destructive">Delete Room</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  );
}

export default App;

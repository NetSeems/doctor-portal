import Home from "./Component/Home";
import { UserContext } from "./Component/UserContext";

function App() {
  return (
    <UserContext>
      <div className="App">
        <Home />
      </div>
    </UserContext>
  );
}

export default App;

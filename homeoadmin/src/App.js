import { BrowserRouter as Router } from "react-router-dom";

import { UserContext } from "./Component/UserContext.js";
import Home from "./Component/Home.js";

function App() {
  return (
    <UserContext>
      <div id="appMain">
        <Home />
      </div>
    </UserContext>
  );
}

export default App;
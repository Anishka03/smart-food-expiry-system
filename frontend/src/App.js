import { Routes, Route } from "react-router-dom";
import { Login } from "./components/Login.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { FoodList } from "./components/FoodList.tsx";
import { Profile } from "./components/Profile.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/foods" element={<FoodList />} />
      <Route path="/profile" element={<Profile />}/>
    </Routes>
  );
}

export default App;


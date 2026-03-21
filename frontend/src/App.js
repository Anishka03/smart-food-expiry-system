import { Routes, Route } from "react-router-dom";
import { Login } from "./components/Login.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { FoodList } from "./components/FoodList.tsx";
import { Profile } from "./components/Profile.tsx";
import { DeleteAccount } from "./components/delete_account.tsx";
import { Register } from "./components/Register.tsx";
import { VerifyRegisterOTP } from "./components/Verify_register_otp.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/foods" element={<FoodList />} />
      <Route path="/profile" element={<Profile />}/>
      <Route path="/delete-account" element={<DeleteAccount />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-register-otp" element={<VerifyRegisterOTP />} />
    </Routes>
  );
}

export default App;


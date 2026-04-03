import { Routes, Route } from "react-router-dom";
import { Login } from "./components/Login.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { FoodList } from "./components/FoodList.tsx";
import { Profile } from "./components/Profile.tsx";
import { DeleteAccount } from "./components/delete_account.tsx";
import { Register } from "./components/Register.tsx";
import { VerifyRegisterOTP } from "./components/Verify_register_otp.tsx";
import { ForgotPassword } from "./components/Forgot_password.tsx";
import { VerifyOTP } from "./components/Verify_otp.tsx";
import { ResetPassword } from "./components/reset_password.tsx";
import { VerifyProfileOTP } from "./components/Verify_profile_otp.tsx";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      {/* ✅ Toaster MUST be inside main return */}
      <Toaster position="top-right" richColors />

      {/* ✅ Routes */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/foods" element={<FoodList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-register-otp" element={<VerifyRegisterOTP />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-profile-otp" element={<VerifyProfileOTP />} />
      </Routes>
    </>
  );
}

export default App;


import { Navigate, Route, Routes } from "react-router";

import { AuthProvider, useAuth } from "@/auth/auth";
import { Shell } from "@/components/shell";
import { Spinner, ToastProvider } from "@/components/ui";
import { Dashboard } from "@/pages/dashboard";
import { Login } from "@/pages/login";
import { ProductForm } from "@/pages/product-form";
import { ProductList } from "@/pages/product-list";
import { Settings } from "@/pages/settings";
import { UsedForm } from "@/pages/used-form";
import { UsedList } from "@/pages/used-list";

/**
 * 로그인 확인이 끝나기 전에는 아무것도 그리지 않는다.
 *
 * 확인 중에 로그인 화면을 잠깐 보여 주면, 이미 로그인한 사람이
 * 새로고침할 때마다 로그인 화면이 번쩍이고 사라진다.
 */
function Gate() {
  const { state } = useAuth();

  if (state.status === "checking") {
    return (
      <div className="flex h-full items-center justify-center text-ink-3">
        <Spinner />
      </div>
    );
  }

  if (state.status === "out") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* 로그인한 사람이 /login 으로 돌아오면 되돌려 보낸다 */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="settings" element={<Settings />} />
        <Route path="used" element={<UsedList />} />
        <Route path="used/new" element={<UsedForm />} />
        <Route path="used/:id" element={<UsedForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </AuthProvider>
  );
}

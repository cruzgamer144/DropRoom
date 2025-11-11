import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "@/components/auth/login-form";
import { ToastProvider } from "@/components/ui/toaster";

describe("LoginForm", () => {
  it("alternates entre convite, senha e recuperação", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <LoginForm />
      </ToastProvider>
    );

    expect(screen.getByLabelText(/Código de Convite/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /entrar com senha/i }));

    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /esqueceu a senha/i }));

    expect(screen.getByRole("button", { name: /enviar link de recuperação/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /voltar ao login com senha/i }));

    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReservationForm } from "@/components/dashboard/reservation-form";
import { ToastProvider } from "@/components/ui/toaster";
import React from "react";

const mockCreateReservation = jest.fn();

jest.mock("@/lib/actions", () => ({
  createReservation: (formData: FormData) => mockCreateReservation(formData),
}));

describe("ReservationForm", () => {
  beforeEach(() => {
    mockCreateReservation.mockResolvedValue({ success: true });
  });

  it("desativa botão quando limite atingido", () => {
    render(
      <ToastProvider>
        <ReservationForm dropId="drop-1" sizes={['EU 40', 'EU 41']} disabled />
      </ToastProvider>
    );

    expect(screen.getByRole("button", { name: /Limite atingido/i })).toBeDisabled();
  });

  it("envia formulário com tamanho selecionado", async () => {
    render(
      <ToastProvider>
        <ReservationForm dropId="drop-1" sizes={['EU 40', 'EU 41']} disabled={false} />
      </ToastProvider>
    );

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "EU 41" } });
    fireEvent.click(screen.getByRole("button", { name: /Reservar Agora/i }));

    await waitFor(() => expect(mockCreateReservation).toHaveBeenCalled());
    const formData = mockCreateReservation.mock.calls[0][0] as FormData;
    expect(formData.get("size")).toBe("EU 41");
    expect(formData.get("dropId")).toBe("drop-1");
  });
});

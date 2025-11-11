import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ElectronicsPageView } from "@/components/electronics/electronics-page";
import { ToastProvider } from "@/components/ui/toaster";
import { Profile, ElectronicsProduct } from "@/types/database";

type CreateElectronicsOrder = (formData: FormData) => Promise<{ success?: boolean; error?: string }>;

jest.mock("@/lib/actions", () => ({
  createElectronicsOrder: jest.fn<ReturnType<CreateElectronicsOrder>, Parameters<CreateElectronicsOrder>>(),
}));

const { createElectronicsOrder } = jest.requireMock("@/lib/actions");

const baseProfile: Profile = {
  id: "user-123",
  email: "vip@droproom.com",
  full_name: "VIP",
  avatar_url: null,
  role: "member",
  monthly_limit: 3,
  monthly_count: 1,
  month_key: "2024-07",
  electronics_monthly_limit: 3,
  electronics_monthly_count: 3,
  electronics_month_key: "2024-07",
  status: "active",
  created_at: new Date().toISOString(),
};

const products: ElectronicsProduct[] = [
  {
    id: "product-1",
    slug: "airpods-pro",
    name: "AirPods Pro Gold",
    description: "Cancelamento ativo com acabamento dourado.",
    image_url: "https://example.com/airpods.jpg",
    price: 279,
    status: "available",
    brand: "Apple",
    category: "true-wireless",
    highlight: true,
    created_at: new Date().toISOString(),
  },
];

const renderView = (profile: Profile) =>
  render(
    <ToastProvider>
      <ElectronicsPageView profile={profile} products={products} monthKey="2024-07" />
    </ToastProvider>
  );

describe("ElectronicsPageView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("desativa a ação quando o limite mensal é atingido", async () => {
    renderView(baseProfile);

    const actionButton = await screen.findByRole("button", { name: /comprar/i });

    expect(actionButton).toBeDisabled();
    expect(actionButton).toHaveAttribute("title", expect.stringContaining("Limite mensal"));
  });

  it("envia pedido quando disponível e dentro do limite", async () => {
    createElectronicsOrder.mockResolvedValueOnce({ success: true });

    renderView({
      ...baseProfile,
      electronics_monthly_count: 1,
    });

    const user = userEvent.setup();
    const actionButton = await screen.findByRole("button", { name: /comprar/i });

    expect(actionButton).toBeEnabled();

    await user.click(actionButton);

    expect(createElectronicsOrder).toHaveBeenCalledTimes(1);
    const formData = createElectronicsOrder.mock.calls[0][0];
    expect(formData.get("productId")).toBe("product-1");
  });
});

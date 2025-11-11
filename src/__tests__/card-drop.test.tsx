import { render, screen } from "@testing-library/react";
import { CardDrop } from "@/components/landing/card-drop";
import { Drop } from "@/types/database";
import React from "react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

const mockDrop: Drop = {
  id: "1",
  slug: "aurum-elite",
  name: "Aurum Elite",
  description: "Sneaker premium",
  image_url: "https://example.com/image.jpg",
  price: 329,
  drop_date: new Date().toISOString(),
  active: true,
  sizes: ["EU 40", "EU 41"],
  created_at: new Date().toISOString(),
};

describe("CardDrop", () => {
  it("renderiza nome e preço", () => {
    render(<CardDrop drop={mockDrop} />);

    expect(screen.getByText("Aurum Elite")).toBeInTheDocument();
    expect(screen.getByText(/€329.00/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reservar Agora/i })).toHaveAttribute("href", "/drops/aurum-elite");
  });
});

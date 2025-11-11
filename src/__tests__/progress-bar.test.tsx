import { render } from "@testing-library/react";
import { ProgressBar } from "@/components/ui/progress";

describe("ProgressBar", () => {
  it("calcula percentagem correta", () => {
    const { container } = render(<ProgressBar value={2} max={4} />);
    const inner = container.querySelector("div > div");
    expect(inner).toHaveStyle({ width: "50%" });
  });
});

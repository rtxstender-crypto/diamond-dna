import { describe, expect, it } from "vitest";
import { savedTheme, THEME_STORAGE_KEY } from "./theme-toggle";

describe("theme preference", () => {
  it("defaults first-time visitors to light", () => expect(savedTheme({getItem: () => null})).toBe("light"));
  it("restores dark", () => expect(savedTheme({getItem: key => key === THEME_STORAGE_KEY ? "dark" : null})).toBe("dark"));
  it("rejects unsupported values", () => expect(savedTheme({getItem: () => "system"})).toBe("light"));
});

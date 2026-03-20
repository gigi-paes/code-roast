import { describe, expect, it } from "vitest";
import {
  HLJS_DETECTION_LANGUAGES,
  hljsIdToLanguageKey,
  LANGUAGE_OPTIONS,
  LANGUAGES,
} from "./languages";

describe("languages", () => {
  describe("LANGUAGES", () => {
    it("should have all expected language keys", () => {
      expect(LANGUAGES).toHaveProperty("javascript");
      expect(LANGUAGES).toHaveProperty("typescript");
      expect(LANGUAGES).toHaveProperty("python");
      expect(LANGUAGES).toHaveProperty("go");
      expect(LANGUAGES).toHaveProperty("rust");
    });

    it("should have required properties for each language", () => {
      for (const [key, lang] of Object.entries(LANGUAGES)) {
        expect(lang).toHaveProperty("name");
        expect(lang).toHaveProperty("shikiId");
        expect(lang).toHaveProperty("hljsId");
        expect(typeof lang.name).toBe("string");
        expect(typeof lang.shikiId).toBe("string");
        expect(typeof lang.hljsId).toBe("string");
      }
    });

    it("should have eager languages defined", () => {
      const eagerLangs = Object.values(LANGUAGES).filter((l) => l.eager);
      expect(eagerLangs.length).toBeGreaterThan(0);
      expect(eagerLangs.map((l) => l.hljsId)).toContain("javascript");
      expect(eagerLangs.map((l) => l.hljsId)).toContain("typescript");
    });
  });

  describe("LANGUAGE_OPTIONS", () => {
    it("should be sorted alphabetically by label", () => {
      const labels = LANGUAGE_OPTIONS.map((opt) => opt.label);
      const sortedLabels = [...labels].sort((a, b) => a.localeCompare(b));
      expect(labels).toEqual(sortedLabels);
    });

    it("should have value and label for each option", () => {
      for (const option of LANGUAGE_OPTIONS) {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
      }
    });

    it("should contain all language keys", () => {
      const langKeys = Object.keys(LANGUAGES);
      const optionValues = LANGUAGE_OPTIONS.map((o) => o.value);
      expect(optionValues).toHaveLength(langKeys.length);
      for (const key of langKeys) {
        expect(optionValues).toContain(key);
      }
    });
  });

  describe("HLJS_DETECTION_LANGUAGES", () => {
    it("should have unique language IDs", () => {
      const unique = new Set(HLJS_DETECTION_LANGUAGES);
      expect(HLJS_DETECTION_LANGUAGES.length).toBe(unique.size);
    });

    it("should include common hljs IDs", () => {
      expect(HLJS_DETECTION_LANGUAGES).toContain("javascript");
      expect(HLJS_DETECTION_LANGUAGES).toContain("typescript");
      expect(HLJS_DETECTION_LANGUAGES).toContain("python");
    });
  });

  describe("hljsIdToLanguageKey", () => {
    it("should return correct language key for valid hljs ID", () => {
      expect(hljsIdToLanguageKey("javascript")).toBe("javascript");
      expect(hljsIdToLanguageKey("typescript")).toBe("typescript");
      expect(hljsIdToLanguageKey("python")).toBe("python");
      expect(hljsIdToLanguageKey("go")).toBe("go");
    });

    it("should return null for unknown hljs ID", () => {
      expect(hljsIdToLanguageKey("unknown")).toBeNull();
      expect(hljsIdToLanguageKey("random")).toBeNull();
    });

    it("should return first matching language when multiple share same hljs ID", () => {
      expect(hljsIdToLanguageKey("javascript")).toBe("javascript");
      expect(hljsIdToLanguageKey("xml")).toBe("html");
    });
  });
});

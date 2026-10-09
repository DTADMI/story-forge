// Tests de parite i18n entre la reference anglaise et le francais.
//
// POURQUOI CE TEST EXISTE
//   Les dictionnaires de ce projet ne sont pas annotes par un type partage : rien
//   dans le systeme de types n'impose qu'une cle presente en anglais existe en
//   francais. Une cle oubliee ne casse pas le build : elle affiche la cle brute
//   (ou la valeur anglaise) a l'utilisateur, ce qui est discret et durable.
//
//   Ce test importe REELLEMENT les deux objets et compare leurs cles feuilles. Il
//   est donc exact, contrairement a une detection par expression reguliere qui
//   compterait aussi des valeurs.
import { describe, it, expect } from "vitest";
import { en } from "@/lib/i18n/translations/en";
import { fr } from "@/lib/i18n/translations/fr";

type Dict = { [key: string]: unknown };

/** Aplatit un dictionnaire imbrique en cles pointees. */
export function flatten(obj: Dict, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flatten(v as Dict, key));
    else out[key] = v;
  }
  return out;
}

describe("parite i18n en/fr", () => {
  const enKeys = new Set(Object.keys(flatten(en as Dict)));
  const frKeys = new Set(Object.keys(flatten(fr as Dict)));

  it("couvre un nombre de cles non nul (le test ne passe pas a vide)", () => {
    expect(enKeys.size).toBeGreaterThan(0);
    expect(frKeys.size).toBeGreaterThan(0);
  });

  it("n'a aucune cle anglaise sans traduction francaise", () => {
    const missing = [...enKeys].filter((k) => !frKeys.has(k)).sort();
    expect(missing, `cles manquantes en fr : ${missing.slice(0, 20).join(", ")}`).toEqual([]);
  });

  it("n'a aucune cle francaise sans equivalent anglais", () => {
    const extra = [...frKeys].filter((k) => !enKeys.has(k)).sort();
    expect(extra, `cles absentes en en : ${extra.slice(0, 20).join(", ")}`).toEqual([]);
  });
});

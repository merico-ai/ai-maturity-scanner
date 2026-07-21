import { type Lang, stringsFor } from "../i18n/index.ts";
import type {
  ProfileCandidate,
  ProfilePrimary,
  ProfileTrait,
  RepositoryProfileEvaluation,
} from "../metrics/profile.ts";

export interface LocalizedProfilePrimary extends ProfilePrimary {
  title: string;
}

export interface LocalizedProfileTrait extends ProfileTrait {
  title: string;
  tierTitle: string;
}

export interface LocalizedProfileCandidate extends ProfileCandidate {
  title: string;
}

export interface LocalizedRepositoryProfile {
  primary: LocalizedProfilePrimary;
  traits: LocalizedProfileTrait[];
  candidates: LocalizedProfileCandidate[];
}

function localizePrimary(primary: ProfilePrimary, lang: Lang): LocalizedProfilePrimary {
  return { ...primary, title: stringsFor(lang).profileTitles[primary.id] };
}

function localizeTrait(trait: ProfileTrait, lang: Lang): LocalizedProfileTrait {
  const strings = stringsFor(lang);
  return {
    ...trait,
    title: strings.profileTitles[trait.id],
    tierTitle: strings.profileTiers[trait.tier],
  };
}

export function localizeRepositoryProfile(
  evaluation: RepositoryProfileEvaluation,
  lang: Lang,
): LocalizedRepositoryProfile {
  return {
    primary: localizePrimary(evaluation.primary, lang),
    traits: evaluation.traits.map((item) => localizeTrait(item, lang)),
    candidates: evaluation.candidates.map((item) => ({
      ...item,
      title: stringsFor(lang).profileTitles[item.id],
    })),
  };
}

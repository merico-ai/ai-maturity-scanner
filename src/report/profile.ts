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
}

export interface LocalizedProfileCandidate extends ProfileCandidate {
  title: string;
}

export interface LocalizedRepositoryProfile {
  primary: LocalizedProfilePrimary;
  supportingTrait?: LocalizedProfileTrait;
  structuralTraits: LocalizedProfileTrait[];
  candidates: LocalizedProfileCandidate[];
}

function localizePrimary(primary: ProfilePrimary, lang: Lang): LocalizedProfilePrimary {
  return { ...primary, title: stringsFor(lang).profileTitles[primary.id] };
}

function localizeTrait(trait: ProfileTrait, lang: Lang): LocalizedProfileTrait {
  return { ...trait, title: stringsFor(lang).profileTitles[trait.id] };
}

export function localizeRepositoryProfile(
  evaluation: RepositoryProfileEvaluation,
  lang: Lang,
): LocalizedRepositoryProfile {
  return {
    primary: localizePrimary(evaluation.primary, lang),
    supportingTrait: evaluation.supportingTrait
      ? localizeTrait(evaluation.supportingTrait, lang)
      : undefined,
    structuralTraits: evaluation.structuralTraits.map((item) => localizeTrait(item, lang)),
    candidates: evaluation.candidates.map((item) => ({
      ...item,
      title: stringsFor(lang).profileTitles[item.id],
    })),
  };
}

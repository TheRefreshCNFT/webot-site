import { findServiceOption, serviceFamilies } from "./catalog";

// Display-name map for retired catalog ids (2026-07 flow realignment).
// Historical jobs keep these family/option ids in their rows, so customer
// surfaces still need human-readable names for them. New job creation and
// preflight accept only the current four-family catalog.

type LegacyServiceFamily = {
  name: string;
  options: Record<string, string>;
};

export const legacyServiceFamilies: Record<string, LegacyServiceFamily> = {
  create_polish: {
    name: "Create & Polish",
    options: {
      greeting_cards_image_cards: "Greeting cards and image cards",
      thank_you_cards_social_posts: "Thank-you cards and social posts",
      tone_rewrites_copy_polish: "Tone rewrites and copy polish",
      logo_concepts_business_cards: "Logo concepts and business card drafts",
      photo_enhancement: "Photo enhancement",
      presentations_graphs: "Presentations and graphs"
    }
  },
  gather_extract: {
    name: "Gather & Extract",
    options: {
      website_research_source_pulls: "Website research and source pulls",
      scraping_structured_data_extraction: "Scraping and structured data extraction",
      ocr_pdf_extraction_document_cleanup: "OCR, PDF extraction, and document cleanup",
      invoice_spreadsheet_cleanup: "Invoice and spreadsheet cleanup",
      source_notes_structured_exports: "Source notes and structured exports",
      transcription: "Transcription"
    }
  },
  media_convert: {
    name: "Media & Convert",
    options: {
      text_to_mp3_audio: "Text-to-MP3 audio",
      video_transcription: "Video transcription",
      audio_cleanup_format_conversion: "Audio cleanup and format conversion",
      file_format_conversion: "File format conversion for customer-ready delivery",
      captions_summaries_media_notes: "Captions, summaries, and media notes"
    }
  },
  build_automate: {
    name: "Build & Automate",
    options: {
      web_development: "Web development",
      code_review_code_writing: "Code review and code writing",
      spreadsheet_formulas_workflow_automation: "Spreadsheet formulas and workflow automation",
      agent_skills_runbooks: "Agent skills and runbooks",
      technical_handoffs_implementation_notes: "Technical handoffs and implementation notes"
    }
  },
  growth_market: {
    name: "Growth & Market",
    options: {
      seo: "SEO",
      marketing_strategies: "Marketing strategies",
      offer_page_briefs: "Offer page briefs",
      campaign_drafts_content_calendars: "Campaign drafts and content calendars",
      audience_channel_notes: "Audience and channel notes"
    }
  },
  review_decide: {
    name: "Review & Decide",
    options: {
      research_comparison_briefs: "Research and comparison briefs",
      decision_memos_vendor_summaries: "Decision memos and vendor summaries",
      executive_briefs_fact_check_packs: "Executive briefs and fact-check packs",
      business_planning: "Business planning",
      risk_tradeoff_next_step_notes: "Risk, tradeoff, and next-step notes"
    }
  },
  career_prep: {
    name: "Career & Prep",
    options: {
      resume_review: "Resume review",
      interview_preparation: "Interview preparation",
      cover_letter_profile_polish: "Cover letter and profile polish",
      role_research_application_notes: "Role research and application notes",
      practice_questions_prep_briefs: "Practice questions and prep briefs"
    }
  },
  plan_itinerary: {
    name: "Plan & Itinerary",
    options: {
      vacation_itineraries: "Vacation itineraries",
      date_nights: "Date nights",
      business_get_togethers: "Business get-togethers",
      road_trips: "Road trips",
      reservation_notes_backup_ideas_supply_notes: "Reservation notes, backup ideas, and helpful supply notes"
    }
  }
};

export function isLegacyServiceFamily(serviceFamily: string): boolean {
  return Object.prototype.hasOwnProperty.call(legacyServiceFamilies, serviceFamily);
}

export function findLegacyServiceOption(serviceFamily: string, serviceType: string): {
  familyName: string;
  optionName: string;
} | null {
  const family = legacyServiceFamilies[serviceFamily];
  const optionName = family?.options[serviceType];

  return family && optionName
    ? {
        familyName: family.name,
        optionName
      }
    : null;
}

// Customer-facing family name: current catalog first, then the legacy map,
// then the raw id so nothing renders blank.
export function displayServiceFamilyName(serviceFamily: string): string {
  const current = findFamilyName(serviceFamily);

  return current ?? legacyServiceFamilies[serviceFamily]?.name ?? serviceFamily;
}

// Customer-facing "Family: Option" label with the same fallback chain the
// request list has always used for unknown ids.
export function displayServiceLabel(serviceFamily: string, serviceType: string): string {
  const current = findServiceOption(serviceFamily, serviceType);

  if (current) {
    return `${current.family.name}: ${current.serviceOption.name}`;
  }

  const legacy = findLegacyServiceOption(serviceFamily, serviceType);

  if (legacy) {
    return `${legacy.familyName}: ${legacy.optionName}`;
  }

  const familyName = findFamilyName(serviceFamily) ?? legacyServiceFamilies[serviceFamily]?.name;
  const optionName = serviceType.replace(/_/g, " ");

  return familyName ? `${familyName}: ${optionName}` : optionName;
}

function findFamilyName(serviceFamily: string): string | null {
  const family = serviceFamilies.find((candidate) => candidate.id === serviceFamily);

  return family ? family.name : null;
}

export type ServiceOption = {
  id: string;
  name: string;
  description: string;
  intake_requirements?: string[];
  badge?: string;
};

export type ServiceFamily = {
  id: string;
  name: string;
  purpose: string;
  intake_requirements: string[];
  quality_signals: string[];
  service_options: ServiceOption[];
};

export const serviceFamilies: ServiceFamily[] = [
  {
    id: "create_design",
    name: "Create & Design",
    purpose: "Create custom images, logos, cards, and creative writing, generated and polished in the studio before you see them.",
    intake_requirements: ["subject and purpose", "style or tone references", "size or format", "usage context"],
    quality_signals: ["Subject and intent fit", "Style and tone consistency", "Natural visual polish", "Export-ready files"],
    service_options: [
      option("image_generation", "Custom image generation", undefined, "Popular"),
      option("logo_concepts", "Logo concepts and brand marks", undefined, "Popular"),
      option("image_upscale_enhance", "Image upscaling and enhancement", undefined, "Trending"),
      option("cards_social_visuals", "Greeting cards and social visuals"),
      option("creative_writing", "Creative writing of all types", [
        "subject and purpose",
        "style or tone references",
        "output format",
        "usage context"
      ])
    ]
  },
  {
    id: "music_audio",
    name: "Music & Sound",
    purpose: "Original music, beats, samples, MIDI, and song production from your lyrics, voice, or ideas, produced and mastered in the studio.",
    intake_requirements: ["concept or lyrics", "style, genre, or reference tracks", "instrumentation preferences", "output format and use"],
    quality_signals: ["Musical fit to the brief's feeling", "Professional loudness and mastering", "Clean mix", "Complete delivery package"],
    service_options: [
      option("lyrics_to_song", "Song production from your lyrics", undefined, "Popular"),
      option("audio_mastering", "Audio mastering and loudness polish"),
      option("beat_production", "Beat production"),
      option("sample_sound_design", "Samples and sound design"),
      option("vocal_backing_track", "Produced music behind your vocal"),
      option("midi_composition", "MIDI composition for your DAW")
    ]
  },
  {
    id: "voice_audio",
    name: "Voice & Audio",
    purpose: "Natural-sounding voice generation, voice cloning, transcription, and audio cleanup or conversion.",
    intake_requirements: ["script or source media", "voice and tone", "output format", "usage context"],
    quality_signals: ["Natural, listenable voices", "Script and transcript accuracy", "Duration and format validation", "Playable output proof"],
    service_options: [
      option("text_to_speech", "Text-to-MP3 voice generation", [
        "script or text",
        "voice and tone"
      ]),
      option("voice_cloning", "Voice cloning from your sample", [
        "script or text",
        "voice sample",
        "output format"
      ]),
      option("transcription", "Audio and video transcription", [
        "source media",
        "speaker notes",
        "timestamp needs",
        "delivery format"
      ]),
      option("audio_cleanup_conversion", "Audio cleanup and format conversion", [
        "source media",
        "cleanup goal",
        "desired output",
        "delivery format"
      ])
    ]
  },
  {
    id: "documents_data",
    name: "Documents & Data",
    purpose: "Turn PDFs, scans, sites, and messy files into clean documents and reliable structured data.",
    intake_requirements: ["source files or sites", "target fields", "output format", "acceptable uncertainty"],
    quality_signals: ["Source traceability", "Field completeness", "Duplicate cleanup", "Format validation"],
    service_options: [
      option("pdf_work", "PDF creation, editing, and forms"),
      option("ocr_document_cleanup", "OCR and scanned-document cleanup"),
      option("scraping_extraction", "Scraping and structured data extraction"),
      option("spreadsheet_invoice_cleanup", "Spreadsheet and invoice cleanup")
    ]
  },
  {
    id: "research_insights",
    name: "Research",
    purpose: "Answer real questions with web research, comparisons, and decision-ready briefs built on checkable sources.",
    intake_requirements: ["question to answer", "decision it supports", "source preferences", "depth and deadline"],
    quality_signals: ["Claim/source separation", "Citation coverage", "Comparable criteria", "Decision-ready summary"],
    service_options: [
      option("web_research_source_pulls", "Website research and source pulls"),
      option("comparison_briefs", "Research and comparison briefs"),
      option("fact_check_packs", "Fact-check and evidence packs")
    ]
  }
];

function hiddenFamilyIds(): Set<string> {
  return new Set(
    (process.env.WEBOT_HIDDEN_FAMILIES ?? "")
      .split(",")
      .map((familyId) => familyId.trim())
      .filter(Boolean)
  );
}

export function getCatalogResponse(): {
  service_families: ServiceFamily[];
  job_statuses: string[];
} {
  const hidden = hiddenFamilyIds();

  return {
    service_families: serviceFamilies.filter((family) => !hidden.has(family.id)).map((family) => ({
      ...family,
      service_options: family.service_options.map((serviceOption) => ({
        ...serviceOption,
        intake_requirements: serviceOption.intake_requirements ? [...serviceOption.intake_requirements] : undefined
      }))
    })),
    job_statuses: [
      "queued",
      "accepted",
      "running",
      "needs_review",
      "ready_for_customer_review",
      "completed",
      "rejected",
      "canceled"
    ]
  };
}

export function findServiceOption(serviceFamily: string, serviceType: string): {
  family: ServiceFamily;
  serviceOption: ServiceOption;
} | null {
  if (hiddenFamilyIds().has(serviceFamily)) {
    return null;
  }

  const family = serviceFamilies.find((candidate) => candidate.id === serviceFamily);
  const serviceOption = family?.service_options.find((candidate) => candidate.id === serviceType);

  return family && serviceOption
    ? {
        family,
        serviceOption
      }
    : null;
}

export function getServiceIntakeRequirements(family: ServiceFamily, serviceOption: ServiceOption): string[] {
  return serviceOption.intake_requirements ? [...serviceOption.intake_requirements] : [...family.intake_requirements];
}

function option(id: string, name: string, intakeRequirements?: string[], badge?: string): ServiceOption {
  return {
    id,
    name,
    description: name,
    intake_requirements: intakeRequirements ? [...intakeRequirements] : undefined,
    badge
  };
}

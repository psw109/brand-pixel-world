export type InteractionType =
  | "youtube_embed"
  | "iframe"
  | "external_link"
  | "internal_route"
  | "lightweight_overlay"
  | "composite";

export type OpenIn = "overlay" | "same_tab" | "new_tab";

export interface RectFootprint {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BuildingInteraction {
  type: InteractionType;
  payload: Record<string, unknown>;
  openIn?: OpenIn;
}

export interface Lot {
  id: string;
  footprint: RectFootprint;
  display?: {
    spriteKey?: string;
    label?: string;
  };
  inquiry: {
    mode: "mailto_template" | "form_post" | "both";
    endpoint?: string;
    mailto?: {
      to: string;
      subjectTemplate: string;
      bodyTemplate: string;
    };
  };
}

export interface Building {
  id: string;
  label: string;
  footprint: RectFootprint;
  sprite: string;
  interaction: BuildingInteraction;
  lotId?: string;
}

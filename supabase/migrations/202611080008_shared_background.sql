-- Shared, couple-scoped application background preference.
-- Existing couples retain the current white background through the default value.

alter table public.couples
  add column background_preset text not null default 'default',
  add column background_custom_color text;

alter table public.couples
  add constraint couples_background_preset_valid check (
    background_preset in (
      'default',
      'soft_pink',
      'cream',
      'lavender',
      'sky_blue',
      'dark_romantic',
      'custom'
    )
  ),
  add constraint couples_background_custom_color_valid check (
    (
      background_preset = 'custom'
      and background_custom_color is not null
      and background_custom_color ~ '^#[0-9A-Fa-f]{6}$'
    )
    or (
      background_preset <> 'custom'
      and background_custom_color is null
    )
  );

comment on column public.couples.background_preset is
  'Shared light-mode application background preset selected by the couple.';
comment on column public.couples.background_custom_color is
  'Optional six-digit hex color used only when background_preset is custom.';

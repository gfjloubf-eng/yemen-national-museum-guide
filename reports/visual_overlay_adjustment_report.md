# Visual Overlay Adjustment Report

## Scope

This report records the small CSS-only selector adjustments made during the final visual QA pass for the live homepage image treatment. The goal was to preserve the premium museum editorial feel while improving the visibility of the real photography.

## Selectors adjusted

1. `.hero-media img`
   - Change: increased image visibility by restoring a more readable opacity from the previously over-darkened treatment.
   - Result: the hero photograph remains clearly legible while keeping the atmospheric editorial layer.

2. `.hero-media::after`
   - Change: softened the dark gradient overlay to reduce the amount of image masking.
   - Result: the hero still maintains depth and a premium museum backdrop treatment, but the underlying photo is no longer washed out.

3. `.civ-card::after`
   - Change: lightened the bottom darkening gradient so the civilization card image remains more visible in the lower portion of the card.
   - Result: the luxury layered effect remains intact without hiding the featured photograph too aggressively.

## Validation notes

- Hero image inspection: photo visibility was the key issue; the image layer had become too dim and the overlay treatment amplified that hiding effect.
- Gallery images: inspected and found to remain clearly visible; no additional overlay adjustments were required.
- Card and banner image containers: inspected; no further overlay masking issues exceeded the acceptable threshold.

## Final QA outcome

The CSS adjustments were limited to the presentation layer only. No data files, JSON files, or image manifests were modified.

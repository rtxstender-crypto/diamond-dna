# Trade Value recalibration report — 2026-08-12

This is a calibration snapshot, not a published ranking. MLB results are provisional because verified contract/control data and live three-season hydration are unavailable. Prospect results are statistical only; external lists are comparison references and are not model inputs.

## DiamondDNA statistical prospect top 25

| # | Player | Value | Band |
|---:|---|---:|---|
|1|Adael Amador|49.4|Strong Prospect|
|2|Ethan Salas|49.4|Strong Prospect|
|3|Max Anderson|48.8|Strong Prospect|
|4|Luke Adams|48.6|Strong Prospect|
|5|Gage Miller|46.9|Top-100 Caliber|
|6|Walker Jenkins|46.6|Top-100 Caliber|
|7|William Bergolla Jr.|46.2|Top-100 Caliber|
|8|Jose Astudillo|46.0|Top-100 Caliber|
|9|Michael Arroyo|46.0|Top-100 Caliber|
|10|Hendry Mendez|45.2|Top-100 Caliber|
|11|Ben Ross|44.7|Top-100 Caliber|
|12|Turner Hill|44.6|Top-100 Caliber|
|13|Carter Garate|44.1|Top-100 Caliber|
|14|Creed Willems|43.6|Top-100 Caliber|
|15|Anderdson Rojas|43.5|Top-100 Caliber|
|16|Josue Briceño|43.4|Top-100 Caliber|
|17|Marco Luciano|43.3|Top-100 Caliber|
|18|Andrick Nava|43.1|Top-100 Caliber|
|19|Kyren Paris|43.1|Top-100 Caliber|
|20|Nick Goodwin|43.0|Top-100 Caliber|
|21|Patrick Clohisy|42.7|Top-100 Caliber|
|22|Dylan Grego|42.6|Top-100 Caliber|
|23|Graysen Tarlow|42.3|Top-100 Caliber|
|24|Mitch Jebb|42.3|Top-100 Caliber|
|25|Brett Wisely|42.2|Top-100 Caliber|

Public 2026 references broadly recognize Walker Jenkins, Ethan Salas, and Josue Briceño. The model correctly places them in meaningful bands but underrates Jenkins relative to his elite external standing because it has no tools/scouting input. Salas is closer after his statistical rebound. Briceño's result does not incorporate injury information.

The principal high outliers are Adael Amador, Max Anderson, Luke Adams, Gage Miller, William Bergolla Jr., Jose Astudillo, Hendry Mendez, Ben Ross, Turner Hill, and Carter Garate. Triple-A proximity plus current statistical performance drives these results; several are not broadly recognized as current global Top-100 players. This remains evidence that the statistical model cannot substitute for scouting.

Recognized elite prospects such as Jesús Made, Leo De Vries, Eli Willits, Josue De Paula, and Kade Anderson are absent or too low because lower-level development risk is intentionally strong and the provider lacks scouting tools/grades. Players who have become MLB-connected are excluded from the prospect pool.

## Provisional MLB top 25

| # | Player | Value | # | Player | Value |
|---:|---|---:|---:|---|---:|
|1|Pete Crow-Armstrong|35.0|14|Andrew Abbott|30.0|
|2|CJ Abrams|33.0|15|Aaron Nola|29.7|
|3|Matthew Liberatore|32.6|16|Tanner Gordon|29.7|
|4|Yordan Alvarez|32.3|17|Brandon Sproat|29.6|
|5|James Wood|31.8|18|Junior Caminero|29.6|
|6|Mike Burrows|31.6|19|Noah Cameron|29.6|
|7|Zach Agnos|31.6|20|Zac Gallen|29.6|
|8|Freddy Peralta|31.4|21|Kyle Freeland|29.5|
|9|Slade Cecconi|31.0|22|Kumar Rocker|29.4|
|10|Joey Cantillo|30.9|23|Andrew Painter|29.3|
|11|Michael Lorenzen|30.9|24|Elly De La Cruz|29.3|
|12|Shane Baz|30.4|25|Juan Soto|29.3|
|13|MacKenzie Gore|30.2||||

These MLB values are not realistic rankings yet. All are suspiciously compressed because 48% of the complete model (contract and controlled future value) is unavailable and the live adapter supplies only the current season. In particular, Elly De La Cruz, Juan Soto, Junior Caminero, James Wood, and established starters cannot be responsibly ordered from these provisional numbers.

## Distribution and remaining work

The prior model could put a strong High-A statistical line near MLB-star value. The recalibrated relationship tests now cap the modeled Rookie example below 40, make Triple-A exceed the same Rookie line by more than 20 points, discount pitching prospects further, and keep even an extreme Triple-A statistical prospect below a proven controlled MLB superstar. Remaining needs are verified service time/contracts, historical live hydration, permitted scouting/ranking data, injury/status data, and full-population percentile calibration.

# Start one server first: npm run dev -- --port 3007
# This script only runs browser specs sequentially; it never launches another server.
$ErrorActionPreference = 'Stop'

try {
  $response = Invoke-WebRequest -Uri 'http://localhost:3007/' -TimeoutSec 120 -UseBasicParsing
  if ($response.StatusCode -ne 200) { throw "Development server returned $($response.StatusCode)" }
} catch {
  throw 'Start one dev server with npm run dev -- --port 3007, wait until it is ready, then rerun this script.'
}

$specs = @(
  'e2e/movement-coordinates.spec.ts',
  'e2e/first-run-and-movement.spec.ts',
  'e2e/usability.spec.ts',
  'e2e/puzzle-edge-cases.spec.ts',
  'e2e/controls-and-settings.spec.ts',
  'e2e/accessibility.spec.ts',
  'e2e/three-d-chapter1.spec.ts',
  'e2e/playthrough.spec.ts',
  'e2e/smoke.spec.ts'
)

foreach ($spec in $specs) {
  Write-Host "Running $spec with one worker"
  & npx playwright test $spec --config=playwright.dev.config.ts --reporter=list --workers=1
  if ($LASTEXITCODE -ne 0) { throw "$spec failed with exit code $LASTEXITCODE" }
}

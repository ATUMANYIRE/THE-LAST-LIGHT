/** Strip raw grid coordinates and developer jargon from player-facing strings */
export function friendlyText(text: string): string {
  return text
    // Engine failure reasons — match BEFORE stripping coords so optional coord capture works
    .replace(/Unpaved ground(?:\s+at)?\s*(?:\(\d+,\s*\d+\))?\s*is unsafe to traverse\.?/gi,
      'Part of the route is unpaved. Build a pathway over it.')
    .replace(/Staircase(?:\s+at)?\s*(?:\(\d+,\s*\d+\))?\s*is impassable for wheelchair\.?/gi,
      'There are steps blocking the wheelchair route. Add a ramp.')
    .replace(/\bat tile\s*\(\d+,\s*\d+\)/gi, 'along the route')
    .replace(/No path found/gi, 'No connected route was found.')
    .replace(/Budget exceeded/gi, 'Not enough budget for this placement.')
    // Strip all remaining (x, y) coordinates (with optional leading "at")
    .replace(/\s*\bat\s+\(\d+,\s*\d+\)/g, '')
    .replace(/\s*\(\d+,\s*\d+\)/g, '')
    // Objective jargon
    .replace(/Connect (\w+) from (?:her|his|their) \w+\s+to the ([^.]+?)\s*(?:using .+?)?(?:\.|$)/i,
      'Help $1 reach the $2.')
    .replace(/Connect (\w+) from (?:her|his|their) \w+/i, 'Help $1')
    .replace(/\busing Paved Walkways under budget\.?/gi, 'using the tools available.')
    .replace(/\busing .+? under budget\.?/gi, 'using the tools available.')
    .replace(/\bunder budget\.?/gi, 'within your budget.')
    .replace(/Barrier:\s*/i, '')
    .replace(/\bimpassable\b/gi, 'impossible to cross')
    .replace(/Redesign the neighborhood path:\s*/i, '')
    .replace(/so BOTH\b/gi, 'so both')
    .replace(/\bPlace a Modular Ramp on the steps or pave an accessible bypass\b/gi,
      'Add a ramp or build an accessible bypass')
    .replace(/  +/g, ' ')
    .trim();
}

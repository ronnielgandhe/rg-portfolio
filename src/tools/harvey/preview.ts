import type { HarveyEvent, Phase } from './events';

export interface Beat {
  at: number;
  phase: Exclude<Phase, 'idle' | 'dialing' | 'ending' | 'ended'>;
  who?: 'harvey' | 'you';
  text?: string;
  dur?: number;
  tool?: string;
  event?: () => HarveyEvent;
}

const statute = (): HarveyEvent => ({
  type: 'statute_card',
  payload: {
    jurisdiction: 'Ontario',
    section: 's. 48 (1)',
    title: 'Notice, landlord personally, etc., requires unit',
    quote: 'A landlord may, by notice, terminate a tenancy if the landlord in good faith requires possession of the rental unit for the purpose of residential occupation for a period of at least one year by the landlord, the landlord\'s spouse, a child or parent of the landlord or the landlord\'s spouse...',
    full_text: 'A landlord may, by notice, terminate a tenancy if the landlord in good faith requires possession of the rental unit for the purpose of residential occupation for a period of at least one year by, (a) the landlord; (b) the landlord\'s spouse; (c) a child or parent of the landlord or the landlord\'s spouse; or (d) a person who provides or will provide care services to the landlord, the landlord\'s spouse, or a child or parent of the landlord or the landlord\'s spouse, if the person receiving the care services resides or will reside in the building, related group of buildings, mobile home park or land lease community in which the rental unit is located. 2006, c. 17, s. 48 (1); 2017, c. 13, s. 7 (1).',
    source: 'ontario residential tenancies act',
    confidence: 0.86,
    see_also: [
      { section: 's. 48.1', title: 'Compensation, notice under s. 48', source: 'ontario residential tenancies act', jurisdiction: 'Ontario', quote: 'A landlord shall compensate a tenant in an amount equal to one month\'s rent or offer the tenant another rental unit acceptable to the tenant if the landlord gives the tenant a notice of termination under section 48.' },
      { section: 's. 57 (1)', title: 'Former tenant\'s application where notice given in bad faith', source: 'ontario residential tenancies act', jurisdiction: 'Ontario', quote: 'The Board may make an order described in subsection (3) if, on application by a former tenant of a rental unit, the Board determines that the landlord gave a notice of termination under section 48 in bad faith.' },
    ],
  },
});

const comp = (): HarveyEvent => ({
  type: 'statute_card',
  payload: {
    jurisdiction: 'Ontario',
    section: 's. 48.1',
    title: 'Compensation, notice under s. 48',
    quote: 'A landlord shall compensate a tenant in an amount equal to one month\'s rent or offer the tenant another rental unit acceptable to the tenant if the landlord gives the tenant a notice of termination under section 48.',
    source: 'ontario residential tenancies act',
    confidence: 0.91,
  },
});

export const SCRIPT: Beat[] = [
  { at: 0, phase: 'connecting' },
  { at: 1400, phase: 'speaking', who: 'harvey', text: 'you\'re in trouble or you wouldn\'t be calling. tell me.', dur: 2600 },
  { at: 4300, phase: 'listening', who: 'you', text: 'my landlord says his son is moving in and i have sixty days to get out. can he do that?', dur: 3800 },
  { at: 8400, phase: 'thinking', tool: 'cite_statute' },
  { at: 9800, phase: 'speaking', event: statute, who: 'harvey', text: 'he can, if it\'s real. section 48 lets a landlord take the unit back for his own kid, but only in good faith and for at least a year. and he owes you a month\'s rent for the trouble.', dur: 6400 },
  { at: 16600, phase: 'listening', who: 'you', text: 'and if i do move, do i get anything?', dur: 2200 },
  { at: 19100, phase: 'thinking', tool: 'cite_statute' },
  { at: 20400, phase: 'speaking', event: comp, who: 'harvey', text: 'one month\'s rent, or another unit you\'re happy with. and if his son never moves in, you can take him to the board.', dur: 5600 },
  { at: 26300, phase: 'listening' },
];

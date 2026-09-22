/** Keys for session → match prefill (client cache; server session is source of truth). */
export const SESSION_ATTENDEES_KEY = 'rallyrank.sessionAttendees';
export const SESSION_TEAMS_KEY = 'rallyrank.sessionTeams';

export type SessionTeamsPrefill = {
  teamA: string[];
  teamB: string[];
};

export function saveSessionTeamsPrefill(clubId: string, teams: SessionTeamsPrefill) {
  sessionStorage.setItem(`${SESSION_TEAMS_KEY}.${clubId}`, JSON.stringify(teams));
}

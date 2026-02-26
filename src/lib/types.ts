export interface Participant {
  id: string;
  name: string;
  stayUntil: number; // minutes from midnight (e.g. 16:30 = 990, 21:00 = 1260)
  joinedAt: number; // unix timestamp ms
}

export interface Config {
  groupCount: number;
}

export interface AppState {
  config: Config;
  groups: GroupWithMembers[];
  totalParticipants: number;
}

export interface GroupWithMembers {
  name: string;
  members: ParticipantDisplay[];
}

export interface ParticipantDisplay {
  id: string;
  name: string;
  stayUntil: number;
  stayUntilFormatted: string;
}
